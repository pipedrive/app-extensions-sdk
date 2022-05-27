export type Options = {
	identifier?: string;
	targetWindow?: Window;
};

export enum Command {
	SHOW_SNACKBAR = 'show_snackbar',
	SHOW_CONFIRMATION = 'show_confirmation',
	RESIZE = 'resize',
	INITIALIZE = 'initialize',
	OPEN_MODAL = 'open_modal',
	CLOSE_MODAL = 'close_modal',
	GET_SIGNED_TOKEN = 'get_signed_token',
}

export enum Event {
	VISIBILITY = 'visibility',
	CLOSE_CUSTOM_MODAL = 'close_custom_modal',
}

export enum MessageType {
	COMMAND = 'command',
	LISTENER = 'listener',
	TRACK = 'track',
}

export enum Color {
	PRIMARY = 'primary',
	SECONDARY = 'secondary',
	NEGATIVE = 'negative',
}

export type Link = {
	url: string;
	label: string;
};

export type SizeArgs = {
	height?: number;
	width?: number;
};

export type InitializationOptions = {
	size?: SizeArgs;
};

export enum Modal {
	DEAL = 'deal',
	ORGANIZATION = 'organization',
	PERSON = 'person',
	JSON_MODAL = 'json_modal',
	CUSTOM_MODAL = 'custom_modal',
}

export type DealModalAttributes = {
	type: Modal.DEAL;
	prefill?: {
		title?: string;
		person?: string;
		organization?: string;
	};
};

export type PersonModalAttributes = {
	type: Modal.PERSON;
	prefill?: {
		name?: string;
		organization?: string;
	};
};

export type OrganizationModalAttributes = {
	type: Modal.ORGANIZATION;
	prefill?: {
		name?: string;
	};
};

export type JSONModalAttributes = {
	type: Modal.JSON_MODAL;
	action_id: string;
};

export type CustomModalAttributes = {
	type: Modal.CUSTOM_MODAL;
	action_id: string;
	data?: {
		[key: string]: string;
	};
};

export type ModalAttributes =
	| OrganizationModalAttributes
	| DealModalAttributes
	| PersonModalAttributes
	| JSONModalAttributes
	| CustomModalAttributes;

export enum ModalStatus {
	CLOSED = 'closed',
	SUBMITTED = 'submitted',
}

export enum TrackingEvent {
	FOCUSED = 'focused',
}

export type Args<T extends Command> = {
	[Command.INITIALIZE]: InitializationOptions;
	[Command.SHOW_SNACKBAR]: {
		message: string;
		link?: Link;
	};
	[Command.SHOW_CONFIRMATION]: {
		title: string;
		description?: string;
		okText?: string;
		cancelText?: string;
		okColor?: Color;
	};
	[Command.RESIZE]: SizeArgs;
	[Command.OPEN_MODAL]: ModalAttributes;
	[Command.CLOSE_MODAL]: void;
	[Command.GET_SIGNED_TOKEN]: void;
}[T];

export type CommandResponse<T extends Command> = {
	[Command.SHOW_SNACKBAR]: void;
	[Command.INITIALIZE]: void;
	[Command.RESIZE]: void;
	[Command.SHOW_CONFIRMATION]: {
		confirmed: boolean;
	};
	[Command.OPEN_MODAL]: {
		status: ModalStatus;
		id?: number;
	};
	[Command.CLOSE_MODAL]: void;
	[Command.GET_SIGNED_TOKEN]: {
		token: string;
	};
}[T];

export type MessageChannelCommandResponse<T extends Command> = {
	data?: CommandResponse<T>;
	error?: string;
};

export type EventResponse<T extends Event> = {
	error?: string;
	data?: {
		[Event.VISIBILITY]: {
			is_visible: boolean;
		};
		[Event.CLOSE_CUSTOM_MODAL]: void;
	}[T];
};

export type Payload<T extends Command> = {
	command: T;
	args: Args<T>;
	type: MessageType;
};

export type ExecuteCommandArgs<T extends Command> = Args<T> extends void ? [] : [Args<T>];
