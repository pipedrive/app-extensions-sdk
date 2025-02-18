import { detectIdentifier, detectIframeFocus, detectUserSettings } from './utils';
import {
	Command,
	CommandResponse,
	Event,
	EventResponse,
	ExecuteCommandArgs,
	InitializationOptions,
	MessageChannelCommandResponse,
	MessageType,
	Options,
	PageStateResponse,
	Payload,
	TrackingEvent,
	UserSettings,
} from './types';

const commandKeys = Object.values(Command);
const eventKeys = Object.values(Event);

class AppExtensionsSDK {
	private readonly identifier: string;
	private initialized: boolean;
	private window: Window;
	public userSettings: UserSettings;

	constructor(options: Options = {}) {
		const { identifier, targetWindow } = options;

		this.initialized = false;
		this.window = targetWindow ?? window.parent;
		this.identifier = identifier ?? detectIdentifier();
		this.userSettings = detectUserSettings();

		if (!this.identifier) {
			throw new Error('Missing custom UI identifier');
		}

		detectIframeFocus(() => {
			this.track(TrackingEvent.FOCUSED);
		});
	}

	private postMessage<K extends Command>(payload: Payload<K>, targetOrigin = '*'): Promise<CommandResponse<K>> {
		return new Promise((resolve, reject) => {
			const channel = new MessageChannel();

			const message = {
				payload,
				id: this.identifier,
			};

			channel.port1.onmessage = ({ data: response }: { data: MessageChannelCommandResponse<K> }) => {
				channel.port1.close();

				const { error, data } = response;

				if (error) {
					reject(new Error(error));
				} else {
					resolve(data);
				}
			};

			this.window.postMessage(message, targetOrigin, [channel.port2]);
		});
	}

	public execute<K extends Command>(command: K, ...args: ExecuteCommandArgs<K>): Promise<CommandResponse<K>> {
		if (!this.initialized) {
			throw new Error('SDK is not initialized');
		}

		if (!commandKeys.includes(command)) {
			throw new Error('Invalid command');
		}

		return this.postMessage({
			command,
			args: args[0],
			type: MessageType.COMMAND,
		});
	}

	private track(event: TrackingEvent, targetOrigin = '*') {
		const message = {
			payload: {
				type: MessageType.TRACK,
				event,
			},
			id: this.identifier,
		};

		this.window.postMessage(message, targetOrigin);
	}

	private onPageVisibilityChange(cb: (response: PageStateResponse) => void) {
		const onChange = () => {
			cb({ data: { state: document.visibilityState } });
		};

		document.addEventListener('visibilitychange', onChange);

		return () => document.removeEventListener('visibilitychange', onChange);
	}

	public listen<K extends Event>(event: K, onEventReceived: (response: EventResponse<K>) => void) {
		if (!eventKeys.includes(event)) {
			throw new Error('Invalid event');
		}

		if (event === Event.PAGE_VISIBILITY_STATE) {
			return this.onPageVisibilityChange(onEventReceived as (response: PageStateResponse) => void);
		}

		const channel = new MessageChannel();

		const message = {
			payload: {
				type: MessageType.LISTENER,
				event,
			},
			id: this.identifier,
		};

		channel.port1.onmessage = ({ data }: { data: EventResponse<K> }) => {
			if (data.error) {
				channel.port1.close();
			}

			onEventReceived(data);

			if (event === Event.USER_SETTINGS_CHANGE && data) {
				this.userSettings = data as UserSettings;
			}
		};

		this.window.postMessage(message, '*', [channel.port2]);

		return () => {
			channel.port1.close();
		};
	}

	public setWindow(window: Window) {
		this.window = window;
	}

	public async initialize(options: InitializationOptions = {}): Promise<this> {
		await this.postMessage({
			command: Command.INITIALIZE,
			args: options,
			type: MessageType.COMMAND,
		});

		this.initialized = true;

		return this;
	}
}

export {
	Command,
	Event,
	Modal,
	ModalStatus,
	Color,
	TrackingEvent,
	MessageType,
	View,
	VisibilityEventInvoker,
} from './types';

export default AppExtensionsSDK;
