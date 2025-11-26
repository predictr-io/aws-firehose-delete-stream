# AWS Firehose Delete Stream

> **⚠️ DESTRUCTIVE ACTION WARNING ⚠️**
>
> **This action permanently deletes Firehose delivery streams and all data in transit.**
>
> - All data currently being buffered will be **permanently lost**
> - Deletion is **irreversible** and **immediate**
> - Any data delivery to destinations will **stop immediately**
> - Carefully verify the `stream-name` parameter before use
> - Consider backing up stream configuration if needed
> - **Test thoroughly in non-production environments first**

A GitHub Action to delete AWS Kinesis Data Firehose delivery streams. Primarily intended for test workflows and temporary stream cleanup.

## Features

- **Delete streams** - Permanently delete Firehose delivery streams
- **Simple integration** - Easy to use in GitHub Actions workflows
- **Name validation** - Validation of stream name format

## Prerequisites

Configure AWS credentials before using this action.

### Option 1: AWS Credentials (Production)

```yaml
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/my-github-actions-role
    aws-region: us-east-1
```

### Option 2: LocalStack (Testing)

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      localstack:
        image: localstack/localstack
        ports:
          - 4566:4566
        env:
          SERVICES: firehose
    steps:
      - name: Delete stream in LocalStack
        uses: predictr-io/aws-firehose-delete-stream@v0
        env:
          AWS_ENDPOINT_URL: http://localhost:4566
          AWS_ACCESS_KEY_ID: test
          AWS_SECRET_ACCESS_KEY: test
          AWS_DEFAULT_REGION: us-east-1
        with:
          stream-name: 'test-stream'
```

## Usage

### Delete Stream

> **⚠️ WARNING:** This will permanently delete the stream and all buffered data.

```yaml
- name: Delete Firehose stream
  uses: predictr-io/aws-firehose-delete-stream@v0
  with:
    stream-name: 'my-delivery-stream'
```

### Test Workflow Example

Delete temporary test streams after integration tests:

```yaml
name: Integration Tests

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      localstack:
        image: localstack/localstack
        ports:
          - 4566:4566
        env:
          SERVICES: firehose

    steps:
      - uses: actions/checkout@v4

      - name: Create test stream
        id: create
        uses: predictr-io/aws-firehose-create-stream@v0
        env:
          AWS_ENDPOINT_URL: http://localhost:4566
          AWS_ACCESS_KEY_ID: test
          AWS_SECRET_ACCESS_KEY: test
          AWS_DEFAULT_REGION: us-east-1
        with:
          stream-name: 'test-stream'

      - name: Run integration tests
        run: |
          export STREAM_ARN="${{ steps.create.outputs.stream-arn }}"
          npm test

      - name: Clean up test stream
        if: always()
        uses: predictr-io/aws-firehose-delete-stream@v0
        env:
          AWS_ENDPOINT_URL: http://localhost:4566
          AWS_ACCESS_KEY_ID: test
          AWS_SECRET_ACCESS_KEY: test
          AWS_DEFAULT_REGION: us-east-1
        with:
          stream-name: 'test-stream'
```

## Inputs

### Required Inputs

| Input | Description |
|-------|-------------|
| `stream-name` | Firehose delivery stream name to delete (1-64 characters, alphanumeric, hyphens, underscores, periods) |

## Outputs

| Output | Description |
|--------|-------------|
| `deleted` | Whether the stream was successfully deleted (`"true"` or `"false"`) |

## Stream Name Format

Stream names must:
- Be 1-64 characters long
- Contain only alphanumeric characters, hyphens (-), underscores (_), and periods (.)
- Not be empty

Example valid names:
- `my-stream`
- `test_stream_01`
- `delivery.stream.2024`

## Error Handling

The action handles common scenarios:

- **Invalid stream name**: Fails with validation error
- **Stream does not exist**: Fails with AWS error
- **AWS permission errors**: Fails with AWS SDK error message
- **Stream name format**: Validates characters and length

## Safety Considerations

> **⚠️ IMPORTANT:** Before using this action, consider:

1. **Data Loss**: All buffered data in the stream will be permanently lost
2. **No Undo**: Stream deletion cannot be reversed
3. **Service Impact**: Applications sending data will fail after deletion
4. **Delivery Interruption**: Data delivery to destinations stops immediately
5. **Monitoring**: Deletion may trigger CloudWatch alarms or break monitoring
6. **Billing**: Stream deletion stops billing immediately
7. **Testing**: Always test in non-production environments first

### Best Practices

- Use in temporary/test workflows only
- Store stream names in secrets or variables, not hardcoded
- Use `if: always()` for cleanup steps to ensure execution
- Document stream configuration before deletion
- Verify stream name is correct before running
- Review AWS permissions for delete operations
- Consider exporting stream metrics/logs first

## Development

### Setup

```bash
git clone https://github.com/predictr-io/aws-firehose-delete-stream.git
cd aws-firehose-delete-stream
npm install
```

### Scripts

```bash
npm run build      # Build the action
npm run type-check # TypeScript checking
npm run lint       # ESLint
npm run check      # Run all checks
```

## License

MIT
