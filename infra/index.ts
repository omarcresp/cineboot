import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as path from "path";

const name = pulumi.getProject();
const stack = pulumi.getStack();

const vpc = new awsx.ec2.Vpc(`${name}-${stack}-vpc`, {
	numberOfAvailabilityZones: 2,
	enableDnsHostnames: true,
});

const securityGroup = new aws.ec2.SecurityGroup(`${name}-${stack}-sg`, {
	vpcId: vpc.vpcId,
	ingress: [
		{
			protocol: "tcp",
			fromPort: 80,
			toPort: 80,
			cidrBlocks: ["0.0.0.0/0"],
		},
		{
			protocol: "tcp",
			fromPort: 5432,
			toPort: 5432,
			self: true,
		},
	],
	egress: [
		{
			protocol: "-1",
			fromPort: 0,
			toPort: 0,
			cidrBlocks: ["0.0.0.0/0"],
		},
	],
});

const repo = new awsx.ecr.Repository(`${name}-repo`, {
	forceDelete: true,
});

const dbName = "cineboot_db";
const dbUser = "cineboot";
const dbPassword = "cineboot_password";

const dbsubnets = new aws.rds.SubnetGroup(`${name}-${stack}-dbsubnets`, {
	subnetIds: vpc.privateSubnetIds,
});

const dbParameterGroup = new aws.rds.ParameterGroup(`${name}-${stack}-pg`, {
	family: "postgres16", // Make sure this matches your PostgreSQL version
	description: "Custom parameter group with SSL disabled",
	parameters: [
		{
			name: "rds.force_ssl",
			value: "0",
			applyMethod: "pending-reboot",
		},
	],
});

const rdsPostgres = new aws.rds.Instance(`${name}-${stack}-db`, {
	engine: "postgres",
	instanceClass: aws.rds.InstanceType.T4G_Micro,
	engineVersion: "16.3",

	allocatedStorage: 20,
	finalSnapshotIdentifier: `${name}-${stack}-db-final-snapshot`,

	vpcSecurityGroupIds: [securityGroup.id],
	dbSubnetGroupName: dbsubnets.name,
	parameterGroupName: dbParameterGroup.name,
	// publiclyAccessible: true,

	dbName,
	username: dbUser,
	password: dbPassword,
});

export const rdsPostgresAddress = rdsPostgres.address;

// const imageName = process.env.IMAGE_NAME || `local-${+new Date()}`;

const image = new awsx.ecr.Image(`${name}-${stack}-image`, {
	repositoryUrl: repo.url,
	path: path.join(__dirname, ".."),
	args: {
		"PGDATABASE": dbName,
		"PGUSER": dbUser,
		"PGPASSWORD": dbPassword,
		"PGHOST": rdsPostgres.address,
		"PORT": "80",
	},
});

export const imageUri = image.imageUri;

const cluster = new aws.ecs.Cluster(`${name}-${stack}-cluster`);
const lb = new aws.lb.LoadBalancer(`${name}-${stack}-lb`, {
	securityGroups: [securityGroup.id],
	internal: false,
	subnets: vpc.publicSubnetIds,
});

const targetGroup = new aws.lb.TargetGroup(`${name}-${stack}-tg`, {
	port: 80,
	protocol: "HTTP",
	targetType: "ip",
	vpcId: vpc.vpcId,
	healthCheck: {
		path: "/health",
		interval: 30,
		timeout: 10,
	},
});

const listener = new aws.lb.Listener(`${name}-${stack}-listener`, {
	loadBalancerArn: lb.arn,
	port: 80,
	protocol: "HTTP",
	defaultActions: [
		{
			type: "forward",
			targetGroupArn: targetGroup.arn,
		},
	],
});

const service = new awsx.ecs.FargateService(`${name}-${stack}-service`, {
	cluster: cluster.arn,
	desiredCount: 2,
	deploymentMinimumHealthyPercent: 25,
	deploymentMaximumPercent: 100,
	networkConfiguration: {
		subnets: vpc.privateSubnetIds,
		assignPublicIp: true,
		securityGroups: [securityGroup.id],
	},
	taskDefinitionArgs: {
		container: {
			name: `${name}-${stack}-container`,
			image: image.imageUri,
			memory: 512,
			cpu: 128,
			portMappings: [
				{
					containerPort: 80,
					targetGroup,
				},
			],
		},
	},
}, { dependsOn: [listener] });

export const serviceName = service.service.name;

export const url = pulumi.interpolate`http://${lb.dnsName}`;
