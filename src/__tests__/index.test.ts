import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import AppExtensionsSDK, { Command, MessageType, View } from '../index';
import type { Metadata, PageContext } from '../types';

type Reply = { data?: unknown; error?: string };

type HostMessage = {
	payload: { command: Command; args: unknown; type: MessageType };
	id: string;
};

const IDENTIFIER = 'test-identifier';

const baseMetadata: Metadata = { windowHeight: 800, windowWidth: 1200 };

let replies: Partial<Record<Command, Reply>> = {};

class FakePort {
	public onmessage: ((event: { data: Reply }) => void) | null = null;
	public peer?: FakePort;
	public close = jest.fn();

	postMessage(data: Reply) {
		this.peer?.onmessage?.({ data });
	}
}

class FakeMessageChannel {
	public port1 = new FakePort();
	public port2 = new FakePort();

	constructor() {
		this.port2.peer = this.port1;
	}
}

const hostPostMessage = (message: HostMessage, _targetOrigin: string, [port]: FakePort[]) => {
	port.postMessage(replies[message.payload.command] ?? {});
};

const postMessage = jest.fn(hostPostMessage);

const targetWindow = { postMessage } as unknown as Window;

Object.defineProperty(globalThis, 'MessageChannel', { value: FakeMessageChannel, configurable: true });

const getMetadata = async (data: Metadata) => {
	replies[Command.GET_METADATA] = { data };

	const sdk = new AppExtensionsSDK({ identifier: IDENTIFIER, targetWindow });

	await sdk.initialize();

	return sdk.execute(Command.GET_METADATA);
};

describe('AppExtensionsSDK GET_METADATA', () => {
	beforeEach(() => {
		replies = {};
		postMessage.mockClear();
	});

	it('posts the get_metadata command with the identifier', async () => {
		await getMetadata(baseMetadata);

		expect(postMessage).toHaveBeenLastCalledWith(
			{
				payload: { command: Command.GET_METADATA, args: undefined, type: MessageType.COMMAND },
				id: IDENTIFIER,
			},
			'*',
			expect.any(Array),
		);
	});

	it('resolves with the page sent by the host', async () => {
		const page: PageContext = { view: View.DEALS, id: '123' };

		const metadata: Metadata = await getMetadata({ ...baseMetadata, page });

		expect(metadata).toEqual({ ...baseMetadata, page });
	});

	it('resolves without page when the host omits it', async () => {
		const metadata: Metadata = await getMetadata(baseMetadata);

		expect(metadata).toEqual(baseMetadata);
		expect(metadata.page).toBeUndefined();
	});
});
