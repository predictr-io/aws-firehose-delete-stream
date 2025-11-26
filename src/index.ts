import * as core from '@actions/core';
import { FirehoseClient } from '@aws-sdk/client-firehose';
import { deleteStream } from './firehose';

async function run(): Promise<void> {
  try {
    // Get inputs
    const streamName = core.getInput('stream-name', { required: true });

    core.info('AWS Firehose Delete Stream');
    core.info(`Stream Name: ${streamName}`);

    // Create Firehose client (uses AWS credentials from environment)
    const client = new FirehoseClient({});

    // Delete stream
    const result = await deleteStream(client, streamName);

    // Handle result
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete stream');
    }

    // Set outputs
    core.setOutput('deleted', 'true');

    // Summary
    core.info('');
    core.info('='.repeat(50));
    core.info('Stream deleted successfully');
    core.info(`Stream Name: ${streamName}`);
    core.info('='.repeat(50));

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.setFailed(errorMessage);
  }
}

run();
