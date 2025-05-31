import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport';
import { Strategy } from 'passport-google-oauth20';
// import { Request } from 'express'; // No es necesario si passReqToCallback es false

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
			passReqToCallback: false, // Cambiado a false
		});
	}

	validate(
		accessToken: string,
		refreshToken: string,
		profile: Profile,
		done: (err?: Error | null, user?: any, info?: any) => void,
	): GoogleUser {
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

		const user: GoogleUser = {
			googleId: googleProfile.id,
			email: googleProfile.emails[0].value,
			name: googleProfile.displayName || '',
		};

		// Llamar a done con el usuario para que Passport lo maneje
		done(null, user);
		return user; // Retornar el usuario para el tipo de retorno de la promesa
	}
}
