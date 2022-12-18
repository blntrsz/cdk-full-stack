import * as cdk from "aws-cdk-lib";
import * as gateway from "aws-cdk-lib/aws-apigateway";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { exec } from "child_process";
import { join } from "path";
import { writeFileSync } from "fs";
import { handlerFunction } from "./cdk-full-stack.my-handler";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export class CdkFullStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Rest API
    const fn = new NodejsFunction(this, "my-handler", {
      runtime: Runtime.NODEJS_18_X,
    });

    const api = new gateway.RestApi(this, "api", {
      defaultCorsPreflightOptions: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "X-Amz-Security-Token",
          "Access-Control-Allow-Origin",
          "Access-Control-Allow-Methods",
          "Access-Control-Allow-Headers",
        ],
        allowOrigins: gateway.Cors.ALL_ORIGINS,
        allowMethods: gateway.Cors.ALL_METHODS, // this is also the default
      },
    });

    const hello = api.root.addResource(handlerFunction.path);
    hello.addMethod(handlerFunction.method, new gateway.LambdaIntegration(fn));

    const oai = new cloudfront.OriginAccessIdentity(this, "cloudfront-oai");

    // Frontend
    const bucket = new s3.Bucket(this, "bucket", {
      bucketName: "cdk-full-stack-bucket",
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [bucket.arnForObjects("*")],
        principals: [
          new iam.CanonicalUserPrincipal(
            oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    // spa configuration so refreshing non-root path will not get as 404
    const errorResponse: cloudfront.ErrorResponse = {
      httpStatus: 403,
      responseHttpStatus: 200,
      responsePagePath: "/index.html",
    };

    const distribution = new cloudfront.Distribution(this, "distribution", {
      defaultRootObject: "index.html",
      errorResponses: [errorResponse],
      defaultBehavior: {
        origin: new cloudfrontOrigins.S3Origin(bucket, {
          originAccessIdentity: oai,
        }),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      },
    });

    const clientDir = join(__dirname, "client");
    exec(`yarn --cwd ${clientDir} build`);

    // Deploy site contents to S3 bucket
    new s3deploy.BucketDeployment(this, "DeployWithInvalidation", {
      sources: [s3deploy.Source.asset(join(clientDir, "dist"))],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"],
    });

    const output = new cdk.CfnOutput(this, "apiEndpoint", {
      value: api.url,
    });

    // writeFileSync(join(clientDir, ".env"), output.value);
  }
}
