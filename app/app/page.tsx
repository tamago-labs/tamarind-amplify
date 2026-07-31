"use client";

import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import {
  Authenticator,
  ThemeProvider,
  Theme,
  useTheme,
  View,
  Heading,
  Text,
  Button,
  useAuthenticator,
} from "@aws-amplify/ui-react";
import WorkspaceSelector from "@/components/app/WorkspaceSelector";
import AppLayout from "@/components/app/AppLayout";
import Dashboard from "@/components/app/Dashboard";

Amplify.configure(outputs);

const theme: Theme = {
  name: "Tamarind Theme",
  tokens: {
    colors: {
      brand: {
        primary: {
          10: "#EDEBFC",
          20: "#D4CFF9",
          40: "#9B8EF2",
          60: "#7B6FED",
          80: "#5B4FE8",
          90: "#4A3FD4",
          100: "#3A2FC0",
        },
      },
    },
    components: {
      authenticator: {
        router: {
          boxShadow: "0 0 16px rgba(0,0,0,0.08)",
          borderWidth: "0",
        },
        form: {
          padding: "var(--amplify-space-medium) var(--amplify-space-xl) var(--amplify-space-xl)",
        },
      },
      button: {
        primary: {
          backgroundColor: "#5B4FE8",
          _hover: {
            backgroundColor: "#4A3FD4",
          },
        },
        link: {
          color: "#5B4FE8",
        },
      },
      fieldcontrol: {
        _focus: {
          boxShadow: "0 0 0 2px #5B4FE8",
        },
      },
      tabs: {
        item: {
          color: "#5A5F6E",
          _active: {
            borderColor: "#5B4FE8",
            color: "#5B4FE8",
          },
        },
      },
    },
    radii: {
      small: "6px",
      medium: "8px",
      large: "12px",
    },
  },
};

function AuthHeader() {
  const { tokens } = useTheme();

  return (
    <View textAlign="center" style={{ padding: 0, marginTop: "32px", marginBottom: "24px" }}>
      <a href="/" style={{ textDecoration: "none" }}>
        <View
          as="div"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              backgroundColor: "#5B4FE8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: "white",
                borderRadius: "2px",
              }}
            />
          </span>
          <Heading level={3} style={{ margin: 0, color: "#1A1D26" }}>
            tamarind
          </Heading>
        </View>
      </a>
    </View>
  );
}

function AuthFooter() {
  const { tokens } = useTheme();

  return (
    <View textAlign="center" padding={`0 0 ${tokens.space.xl} 0`} marginTop="xl">
      <Text color={tokens.colors.neutral[60]} fontSize="sm">
        © {new Date().getFullYear()} Tamago Labs. All rights reserved.
      </Text>
    </View>
  );
}

function SignInHeader() {
  const { tokens } = useTheme();

  return (
    <Heading
      padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
      level={5}
    >
      Sign in to your account
    </Heading>
  );
}

function SignInFooter() {
  const { toForgotPassword } = useAuthenticator();

  return (
    <View textAlign="center">
      <Button
        fontWeight="normal"
        onClick={toForgotPassword}
        size="small"
        variation="link"
      >
        Reset Password
      </Button>
    </View>
  );
}

function SignUpHeader() {
  const { tokens } = useTheme();

  return (
    <Heading
      padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
      level={5}
    >
      Create a new account
    </Heading>
  );
}

function SignUpFooter() {
  const { toSignIn } = useAuthenticator();

  return (
    <View textAlign="center">
      <Button
        fontWeight="normal"
        onClick={toSignIn}
        size="small"
        variation="link"
      >
        Back to Sign In
      </Button>
    </View>
  );
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

interface Workspace {
  id: string;
  name: string;
  role: string;
}

function AuthenticatedApp({ signOut, user }: { signOut?: () => void; user?: any }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const client = generateClient<Schema>();
  const userId = user?.username || user?.userId || "";

  useEffect(() => {
    loadWorkspaces();
  }, [userId]);

  async function loadWorkspaces() {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data: memberships, errors } = await client.models.WorkspaceMember.list({
        filter: { userId: { eq: userId } },
      });

      if (memberships && memberships.length > 0) {
        const workspaceList: Workspace[] = [];
        for (const membership of memberships) {
          if (membership.workspaceId) {
            const { data: workspace } = await client.models.Workspace.get({
              id: membership.workspaceId,
            });
            if (workspace) {
              workspaceList.push({
                id: workspace.id,
                name: workspace.name,
                role: membership.role || "member",
              });
            }
          }
        }
        setWorkspaces(workspaceList);
      }
    } catch (error) {
      console.error("Error loading workspaces:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateWorkspace(name: string, description: string) {
    try {
      const inviteCode = generateInviteCode();

      const { data: workspace } = await client.models.Workspace.create({
        name,
        description,
        inviteCode,
        ownerId: userId,
      });

      if (workspace) {
        await client.models.WorkspaceMember.create({
          workspaceId: workspace.id,
          userId,
          role: "admin",
          status: "active",
        });

        setWorkspaces([...workspaces, { id: workspace.id, name, role: "admin" }]);
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  }

  async function handleJoinWorkspace(inviteCode: string) {
    try {
      const { data: allWorkspaces } = await client.models.Workspace.list({
        filter: { inviteCode: { eq: inviteCode } },
      });

      if (allWorkspaces && allWorkspaces.length > 0) {
        const workspace = allWorkspaces[0];

        const { data: existingMembership } = await client.models.WorkspaceMember.list({
          filter: {
            workspaceId: { eq: workspace.id },
            userId: { eq: userId },
          },
        });

        if (existingMembership && existingMembership.length > 0) {
          alert("You are already a member of this workspace.");
          return;
        }

        await client.models.WorkspaceMember.create({
          workspaceId: workspace.id,
          userId,
          role: "payee",
          status: "pending",
        });

        alert("Request sent! Waiting for admin approval.");
      } else {
        alert("Invalid invite code.");
      }
    } catch (error) {
      console.error("Error joining workspace:", error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-panel flex items-center justify-center">
        <p className="text-sub">Loading...</p>
      </div>
    );
  }

  if (!selectedWorkspace) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <Button variation="link" onClick={signOut} className="text-sub hover:text-ink">
            Sign out
          </Button>
        </div>
        <WorkspaceSelector
          workspaces={workspaces}
          onSelect={(id) => {
            const ws = workspaces.find((w) => w.id === id);
            if (ws) setSelectedWorkspace(ws);
          }}
          onCreate={handleCreateWorkspace}
          onJoin={handleJoinWorkspace}
        />
      </>
    );
  }

  const pendingMessage =
    selectedWorkspace.role !== "admin"
      ? `Your role (${selectedWorkspace.role}) is pending approval.`
      : undefined;

  return (
    <AppLayout workspaceName={selectedWorkspace.name} pendingMessage={pendingMessage}>
      <Dashboard />
    </AppLayout>
  );
}

const components = {
  Header: AuthHeader,
  Footer: AuthFooter,
  SignIn: {
    Header: SignInHeader,
    Footer: SignInFooter,
  },
  SignUp: {
    Header: SignUpHeader,
    Footer: SignUpFooter,
  },
};

const formFields = {
  signIn: {
    username: {
      placeholder: "Enter your email",
    },
  },
  signUp: {
    password: {
      label: "Password:",
      placeholder: "Enter your password",
      isRequired: true,
    },
    confirm_password: {
      label: "Confirm Password:",
      isRequired: true,
    },
  },
};

export default function AppPage() {
  return (
    <ThemeProvider theme={theme}>
      <Authenticator formFields={formFields} components={components}>
        {({ signOut, user }: any) => <AuthenticatedApp signOut={signOut} user={user} />}
      </Authenticator>
    </ThemeProvider>
  );
}
