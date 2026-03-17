import Build from '../../commands/build';
import { getError, getErrorAsync, getMockOclifConfig } from './utils';
import { RequestedPlatform } from '../../platform';

describe(Build, () => {
  function sanitizeFlags(rawFlags: Record<string, unknown>) {
    const command = new Build([], getMockOclifConfig()) as any;
    return command.sanitizeFlags({
      platform: 'android',
      'skip-credentials-check': false,
      'skip-project-configuration': false,
      profile: undefined,
      'non-interactive': false,
      local: false,
      output: undefined,
      wait: true,
      'stream-logs': false,
      'clear-cache': false,
      json: false,
      'auto-submit': false,
      'auto-submit-with-profile': undefined,
      'resource-class': undefined,
      message: undefined,
      'build-logger-level': undefined,
      'freeze-credentials': false,
      'verbose-logs': false,
      'what-to-test': undefined,
      ...rawFlags,
    });
  }

  test('rejects --stream-logs with --no-wait', () => {
    const error = getError(() => sanitizeFlags({ 'stream-logs': true, wait: false })) as Error;
    expect(error.message).toContain('--stream-logs cannot be used with --no-wait');
  });

  test('rejects --stream-logs with --json', () => {
    const error = getError(() => sanitizeFlags({ 'stream-logs': true, json: true })) as Error;
    expect(error.message).toContain('--stream-logs cannot be used with --json');
  });

  test('rejects --stream-logs for local builds', async () => {
    const command = new Build([], getMockOclifConfig()) as any;
    const flags = sanitizeFlags({ 'stream-logs': true, local: true });

    const error = await getErrorAsync(() =>
      command.ensurePlatformSelectedAsync({
        ...flags,
        requestedPlatform: RequestedPlatform.Android,
      })
    );

    expect((error as Error).message).toContain('--stream-logs is not supported for local builds');
  });

  test('allows --stream-logs for all-platform builds', async () => {
    const command = new Build([], getMockOclifConfig()) as any;
    const flags = sanitizeFlags({ 'stream-logs': true, platform: 'all' });

    await expect(
      command.ensurePlatformSelectedAsync({
        ...flags,
        requestedPlatform: RequestedPlatform.All,
      })
    ).resolves.toMatchObject({
      requestedPlatform: RequestedPlatform.All,
      isBuildLogStreamingEnabled: true,
    });
  });
});
