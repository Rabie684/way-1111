
export enum UserRole {
    Student = 'student',
    Professor = 'professor',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    university: string;
    college: string;
    avatar: string;
    subscribedChannels: string[]; // array of channel IDs
}

export enum PostType {
    PDF = 'pdf',
    Image = 'image',
    Video = 'video',
}

export interface Post {
    id: string;
    type: PostType;
    title: string;
    url: string;
    createdAt: string;
}

export interface Channel {
    id: string;
    name: string;
    specialization: string;
    professorId: string;
    meetLink: string;
    posts: Post[];
    subscribers: number;
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
}

export interface DirectMessage extends Message {
    receiverId: string;
}

export interface ChannelMessage extends Message {
    channelId: string;
}