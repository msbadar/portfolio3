import { Injectable } from '@nestjs/common';

export interface MetadataResponse {
  title: string;
  titleTemplate: string;
  description: string;
  keywords: string[];
  authors: Array<{ name: string }>;
  creator: string;
  openGraph: {
    type: string;
    locale: string;
    url: string;
    siteName: string;
    title: string;
    description: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
  };
  robots: {
    index: boolean;
    follow: boolean;
  };
}

@Injectable()
export class MetadataService {
  getMetadata(): MetadataResponse {
    // You can customize this based on environment variables or database
    // For now, returning default values
    return {
      title: 'Threadz - Social Platform',
      titleTemplate: '%s | Threadz',
      description:
        'A modern social platform for sharing threads and blogs. Connect with others and share your thoughts.',
      keywords: ['social platform', 'threads', 'blogs', 'community', 'share'],
      authors: [{ name: 'Threadz Team' }],
      creator: 'Threadz',
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://threadz.app',
        siteName: 'Threadz',
        title: 'Threadz - Social Platform',
        description: 'A modern social platform for sharing threads and blogs',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Threadz - Social Platform',
        description: 'A modern social platform for sharing threads and blogs',
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}
