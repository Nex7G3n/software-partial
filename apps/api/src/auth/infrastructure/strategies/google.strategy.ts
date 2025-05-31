import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport';
import { Strategy } from 'passport-google-oauth20';
import { Request } from 'express';

interface GoogleProfile extends Profile {
	id: string;
	emails: { value: string }[];
}

export interface GoogleUser {
	googleId: string;
	email: string;
	name: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(config: ConfigService) {
		super({
			clientID: config.get('GOOGLE_CLIENT_ID')!,
			clientSecret: config.get('GOOGLE_CLIENT_SECRET')!,
			callbackURL: config.get('GOOGLE_CALLBACK_URL')!,
			scope: ['email', 'profile'],
			passReqToCallback: true,
		});
	}

	validate(...args: any[]): GoogleUser {
		// Extraer los argumentos de forma flexible
		const profile: Profile = args[args.length - 1];
		const refreshToken: string = args[args.length - 2];
		const accessToken: string = args[args.length - 3];
		const req: Request | undefined = args.length === 4 ? args[0] : undefined;

		console.log('Google Profile:', profile);
		if (!profile) {
			throw new Error('Google profile is undefined or null');
		}

		const googleProfile = profile as GoogleProfile;

		if (
			!googleProfile.emails ||
			googleProfile.emails.length === 0 ||
			!googleProfile.emails[0]
		) {
			throw new Error('No email found in Google profile');
		}

		return {
			googleId: googleProfile.id,
			email: googleProfile.emails[0].value,
			name: googleProfile.displayName || '',
		};
	}
}
