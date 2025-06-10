import { signIn, signOut } from "next-auth/react";

export const handleSignIn = () => signIn("google");
export const handleFBSignIn = () => signIn("facebook");
export const handleSignOut = () => signOut();
