#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FargateSimpleStack } from './cdk';

const app = new cdk.App();
new FargateSimpleStack(app, 'FargateSimpleStack');