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
	REDIRECT_TO = 'redirect_to',
	SHOW_FLOATING_WINDOW = 'show_floating_window',
	HIDE_FLOATING_WINDOW = 'hide_floating_window',
	MINIMIZE_FLOATING_WINDOW = 'minimize_floating_window',
}

export enum Event {
	VISIBILITY = 'visibility',
	CLOSE_CUSTOM_MODAL = 'close_custom_modal',
	SHOW_FLOATING_WINDOW = 'show_floating_window',
	HIDE_FLOATING_WINDOW = 'hide_floating_window',
	MINIMIZE_FLOATING_WINDOW = 'minimize_floating_window',
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

export enum FloatingWindowEventInvoker {
	USER = 'user',
	COMMAND = 'command',
}

export type FloatingWindowEventAttributes = {
	invoker: FloatingWindowEventInvoker;
};

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
	[Command.REDIRECT_TO]: RedirectAttributes;
	[Command.SHOW_FLOATING_WINDOW]: void;
	[Command.HIDE_FLOATING_WINDOW]: void;
	[Command.MINIMIZE_FLOATING_WINDOW]: void;
}[T];

export type CommandResponse<T extends Command> = {
	[Command.SHOW_SNACKBAR]: void;
	[Command.INITIALIZE]: void;
	[Command.RESIZE]: void;
	[Command.REDIRECT_TO]: void;
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
	[Command.SHOW_FLOATING_WINDOW]: void;
	[Command.HIDE_FLOATING_WINDOW]: void;
	[Command.MINIMIZE_FLOATING_WINDOW]: void;
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
		[Event.SHOW_FLOATING_WINDOW]: FloatingWindowEventAttributes;
		[Event.HIDE_FLOATING_WINDOW]: FloatingWindowEventAttributes;
		[Event.MINIMIZE_FLOATING_WINDOW]: FloatingWindowEventAttributes;
	}[T];
};

export type Payload<T extends Command> = {
	command: T;
	args: Args<T>;
	type: MessageType;
};

export type ExecuteCommandArgs<T extends Command> = Args<T> extends void ? [] : [Args<T>];

export enum View {
	DEALS = 'deals',
	LEADS = 'leads',
	ORGANIZATIONS = 'organizations',
	CONTACTS = 'contacts',
	CAMPAIGNS = 'campaigns',
	PROJECTS = 'projects',
	SETTINGS = 'settings',
}

export type RedirectAttributes = {
	view: View;
	id?: number | string;
};
