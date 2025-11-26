import {
  FirehoseClient,
  DeleteDeliveryStreamCommand
} from '@aws-sdk/client-firehose';
import * as core from '@actions/core';

export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Validate stream name
 */
export function validateStreamName(streamName: string): void {
  if (!streamName || streamName.trim().length === 0) {
    throw new Error('Stream name cannot be empty');
  }

  if (streamName.length > 64) {
    throw new Error(`Stream name exceeds maximum length of 64 characters (got ${streamName.length})`);
  }

  const validPattern = /^[a-zA-Z0-9_.-]+$/;
  if (!validPattern.test(streamName)) {
    throw new Error(
      `Stream name "${streamName}" contains invalid characters. Only alphanumeric characters, hyphens, underscores, and periods are allowed.`
    );
  }
}

/**
 * Delete a Firehose delivery stream
 */
export async function deleteStream(
  client: FirehoseClient,
  streamName: string
): Promise<DeleteResult> {
  try {
    // Validate input
    validateStreamName(streamName);

    core.info(`Deleting stream: ${streamName}`);

    // Delete stream
    const command = new DeleteDeliveryStreamCommand({
      DeliveryStreamName: streamName
    });

    await client.send(command);

    core.info('✓ Stream deleted successfully');

    return {
      success: true
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.error(`Failed to delete stream: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage
    };
  }
}
