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
	SET_NOTIFICATION = 'set_notification',
	SET_FOCUS_MODE = 'set_focus_mode',
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
	ACTIVITY = 'activity',
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

export type ActivityModalAttributes = {
	type: Modal.ACTIVITY;
	prefill?: {
		subject?: string;
		dueDate?: string;
		dueTime?: string;
		duration?: string;
		note?: string;
		description?: string;
		deal?: number;
		organization?: number;
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
	| ActivityModalAttributes
	| JSONModalAttributes
	| CustomModalAttributes;

export enum ModalStatus {
	CLOSED = 'closed',
	SUBMITTED = 'submitted',
}

export enum TrackingEvent {
	FOCUSED = 'focused',
}

export enum VisibilityEventInvoker {
	USER = 'user',
	COMMAND = 'command',
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
	[Command.REDIRECT_TO]: RedirectAttributes;
	[Command.SHOW_FLOATING_WINDOW]: {
		context?: Partial<Record<string, unknown>>;
	};
	[Command.HIDE_FLOATING_WINDOW]: {
		context?: Partial<Record<string, unknown>>;
	};
	[Command.SET_NOTIFICATION]: {
		number?: number;
	};
	[Command.SET_FOCUS_MODE]: boolean;
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
	[Command.SET_NOTIFICATION]: void;
	[Command.SET_FOCUS_MODE]: void;
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
			context?: Partial<Record<string, unknown> & Record<'invoker', VisibilityEventInvoker>>;
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
