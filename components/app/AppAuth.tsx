"use client";

import { ReactNode } from "react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import {
  Authenticator,
  Button,
  Heading,
  Text,
  Theme,
  ThemeProvider,
  useAuthenticator,
  useTheme,
  View,
} from "@aws-amplify/ui-react";
import WalletProviders from "./WalletProviders";

Amplify.configure(outputs);

const theme: Theme = {
  name: "Tamarind Theme",
  tokens: {
    colors: { brand: { primary: { 10: "#EDEBFC", 20: "#D4CFF9", 40: "#9B8EF2", 60: "#7B6FED", 80: "#5B4FE8", 90: "#4A3FD4", 100: "#3A2FC0" } } },
    components: {
      authenticator: { router: { boxShadow: "0 0 16px rgba(0,0,0,0.08)", borderWidth: "0" }, form: { padding: "var(--amplify-space-medium) var(--amplify-space-xl) var(--amplify-space-xl)" } },
      button: { primary: { backgroundColor: "#5B4FE8", _hover: { backgroundColor: "#4A3FD4" } }, link: { color: "#5B4FE8" } },
      fieldcontrol: { _focus: { boxShadow: "0 0 0 2px #5B4FE8" } },
      tabs: { item: { color: "#5A5F6E", _active: { borderColor: "#5B4FE8", color: "#5B4FE8" } } },
    },
    radii: { small: "6px", medium: "8px", large: "12px" },
  },
};

function AuthHeader() {
  return <View textAlign="center" style={{ padding: 0, marginTop: "32px", marginBottom: "24px" }}><a href="/" style={{ textDecoration: "none" }}><View as="div" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}><span style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#5B4FE8", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ width: "8px", height: "8px", backgroundColor: "white", borderRadius: "2px" }} /></span><Heading level={3} style={{ margin: 0, color: "#1A1D26" }}>tamarind</Heading></View></a></View>;
}

function AuthFooter() {
  const { tokens } = useTheme();
  return <View textAlign="center" padding={`0 0 ${tokens.space.xl} 0`} marginTop="xl"><Text color={tokens.colors.neutral[60]} fontSize="sm">© {new Date().getFullYear()} Tamago Labs. All rights reserved.</Text></View>;
}

function SignInHeader() { const { tokens } = useTheme(); return <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={5}>Sign in to your account</Heading>; }
function SignUpHeader() { const { tokens } = useTheme(); return <Heading padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`} level={5}>Create a new account</Heading>; }
function SignInFooter() { const { toForgotPassword } = useAuthenticator(); return <View textAlign="center"><Button fontWeight="normal" onClick={toForgotPassword} size="small" variation="link">Reset Password</Button></View>; }
function SignUpFooter() { const { toSignIn } = useAuthenticator(); return <View textAlign="center"><Button fontWeight="normal" onClick={toSignIn} size="small" variation="link">Back to Sign In</Button></View>; }

const components = { Header: AuthHeader, Footer: AuthFooter, SignIn: { Header: SignInHeader, Footer: SignInFooter }, SignUp: { Header: SignUpHeader, Footer: SignUpFooter } };
const formFields = { signIn: { username: { placeholder: "Enter your email" } }, signUp: { password: { label: "Password:", placeholder: "Enter your password", isRequired: true }, confirm_password: { label: "Confirm Password:", isRequired: true } } };

export default function AppAuth({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={theme}><Authenticator formFields={formFields} components={components}><WalletProviders>{children}</WalletProviders></Authenticator></ThemeProvider>;
}
