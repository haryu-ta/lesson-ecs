import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class FargateSimpleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. VPCを作成（パブリックサブネットのみ）
    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 1,
      subnetConfiguration: [
        {
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // 2. ECSクラスターを作成
    const cluster = new ecs.Cluster(this, 'MyCluster', {
      vpc: vpc,
      clusterName: 'MyFargateCluster',
    });

    // 3. セキュリティグループを作成（ポート80を開放）
    const sg = new ec2.SecurityGroup(this, 'FargateSG', {
      vpc,
      allowAllOutbound: true,
      description: 'Allow HTTP traffic to Fargate tasks',
      securityGroupName: 'FargatePublicSG',
    });
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8080), 'Allow HTTP from anywhere');

    // 実行ロールを作成
    const executionRole = new iam.Role(this, 'EcsExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // ECR からイメージをpullするためのポリシーを付与
    executionRole.addManagedPolicy(
      iam.ManagedPolicy.fromManagedPolicyArn(
        this,
        'EcsTaskExecutionRolePolicy',
        'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy'
      )
    );


    // 4. Fargateタスク定義を作成
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'MyTaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
      executionRole: executionRole,
    });
  
    taskDefinition.taskRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ContainerRegistryReadOnly")
    );

    // 5. コンテナをタスクに追加
    const container = taskDefinition.addContainer('MyContainer', {
      image: ecs.ContainerImage.fromRegistry('906317261898.dkr.ecr.ap-northeast-1.amazonaws.com/sunandmoon91674/my-app:latest'),
    });
    container.addPortMappings({
      containerPort: 8080,
    });

    // 6. Fargateサービスを作成（ALBなし、パブリックIP割り当て）
    new ecs.FargateService(this, 'MyFargateService', {
      cluster,
      taskDefinition,
      assignPublicIp: true,
      desiredCount: 1,
      securityGroups: [sg], // 作成したセキュリティグループを適用
      serviceName: 'MyFargateService',
    });
  }
}
