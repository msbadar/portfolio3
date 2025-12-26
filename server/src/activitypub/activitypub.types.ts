// ActivityPub and ActivityStreams types
// Based on W3C ActivityPub and ActivityStreams specifications

export const ACTIVITY_STREAMS_CONTEXT = 'https://www.w3.org/ns/activitystreams';
export const SECURITY_CONTEXT = 'https://w3id.org/security/v1';

export interface ActivityPubContext {
  '@context':
    | string
    | string[]
    | (string | Record<string, string | Record<string, string>>)[];
}

export interface PublicKey {
  id: string;
  owner: string;
  publicKeyPem: string;
}

export interface Actor extends ActivityPubContext {
  id: string;
  type: 'Person' | 'Service' | 'Application' | 'Group' | 'Organization';
  preferredUsername: string;
  name: string;
  summary?: string;
  url?: string;
  inbox: string;
  outbox: string;
  followers?: string;
  following?: string;
  publicKey?: PublicKey;
  icon?: {
    type: 'Image';
    mediaType: string;
    url: string;
  };
  image?: {
    type: 'Image';
    mediaType: string;
    url: string;
  };
  endpoints?: {
    sharedInbox?: string;
  };
}

export interface Activity extends ActivityPubContext {
  id: string;
  type: string;
  actor: string;
  published?: string;
  to?: string[];
  cc?: string[];
  object?: ActivityObject | string;
}

export interface ActivityObject {
  id: string;
  type: string;
  content?: string;
  published?: string;
  attributedTo?: string;
  to?: string[];
  cc?: string[];
  url?: string;
  attachment?: Attachment[];
  inReplyTo?: string;
  sensitive?: boolean;
  summary?: string;
  tag?: Tag[];
}

export interface Attachment {
  type: 'Document' | 'Image' | 'Video' | 'Audio';
  mediaType: string;
  url: string;
  name?: string;
}

export interface Tag {
  type: 'Mention' | 'Hashtag' | 'Emoji';
  href?: string;
  name: string;
}

export interface OrderedCollection extends ActivityPubContext {
  id: string;
  type: 'OrderedCollection';
  totalItems: number;
  first?: string;
  last?: string;
  orderedItems?: (Activity | ActivityObject)[];
}

export interface OrderedCollectionPage extends ActivityPubContext {
  id: string;
  type: 'OrderedCollectionPage';
  partOf: string;
  next?: string;
  prev?: string;
  totalItems: number;
  orderedItems: (Activity | ActivityObject)[];
}

export interface WebFingerLink {
  rel: string;
  type?: string;
  href?: string;
  template?: string;
}

export interface WebFingerResponse {
  subject: string;
  aliases?: string[];
  links: WebFingerLink[];
}

export interface NodeInfoSoftware {
  name: string;
  version: string;
}

export interface NodeInfoUsage {
  users: {
    total: number;
    activeMonth?: number;
    activeHalfyear?: number;
  };
  localPosts: number;
}

export interface NodeInfo {
  version: string;
  software: NodeInfoSoftware;
  protocols: string[];
  usage: NodeInfoUsage;
  openRegistrations: boolean;
  metadata?: Record<string, unknown>;
}

export interface NodeInfoLinks {
  links: {
    rel: string;
    href: string;
  }[];
}

// Activity types
export type CreateActivity = Activity & {
  type: 'Create';
  object: ActivityObject;
};

export type FollowActivity = Activity & {
  type: 'Follow';
  object: string;
};

export type AcceptActivity = Activity & {
  type: 'Accept';
  object: FollowActivity | string;
};

export type UndoActivity = Activity & {
  type: 'Undo';
  object: Activity | string;
};

export type LikeActivity = Activity & {
  type: 'Like';
  object: string;
};

export type AnnounceActivity = Activity & {
  type: 'Announce';
  object: string;
};

export type DeleteActivity = Activity & {
  type: 'Delete';
  object: string | { id: string; type: 'Tombstone' };
};
