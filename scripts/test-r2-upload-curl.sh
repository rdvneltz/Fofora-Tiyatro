#!/bin/bash

# Test file
echo "Test video content" > /tmp/test-r2.txt

# R2 Credentials
ACCESS_KEY="970d413506a466cffa0f98966c973404"
SECRET_KEY="1132a830ea9ea1ad7817be0bc827eb666def3602015e670d37911079e6ce2bf8"
BUCKET="fofora-tiytro-videos"
ACCOUNT_ID="4ad9a16037171b6689602b13bbbe6be8"
ENDPOINT="https://${ACCOUNT_ID}.r2.cloudflarestorage.com"

# S3 compatible upload with curl
FILE="/tmp/test-r2.txt"
OBJECT_KEY="test/test.txt"

echo "Testing R2 upload via curl..."
echo "Endpoint: $ENDPOINT"
echo "Bucket: $BUCKET"
echo ""

# Using AWS CLI if available (better for testing)
if command -v aws &> /dev/null; then
    echo "Using AWS CLI..."
    AWS_ACCESS_KEY_ID=$ACCESS_KEY \
    AWS_SECRET_ACCESS_KEY=$SECRET_KEY \
    aws s3 cp $FILE s3://$BUCKET/$OBJECT_KEY \
        --endpoint-url $ENDPOINT \
        --region auto
else
    echo "AWS CLI not found. Install it with: brew install awscli"
    echo "Or use the Node.js SDK (which we're debugging)"
fi

rm -f /tmp/test-r2.txt
