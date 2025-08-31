"use client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();

  const { data: session, isPending, error } = authClient.useSession();

  if (error || (!session && !isPending)) {
    router.push("/login");
  }

  const signOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch {
      toast("Error signing out", {
        description: "An error occurred signing out",
      });
    }
  };

  return (
    <div className="h-screen h-full w-screen flex overflow-y-auto">
      <div className="flex flex-col w-screen items-center p-8 pt-24 pb-10">
        <div className="flex flex-col min-w-md max-w-md">
          {!isPending && session ? (
            <div className="gap-4 flex flex-col">
              <p className="text-2xl">{session.user.name}</p>
              <p className="text-l">Account Options</p>
              <Button variant="neutral" className="w-fit" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex flex-row max-w-md flex-grow-1 justify-center w-full">
              <Spinner variant={"ellipsis"} size={32} />
            </div>
          )}
          <div className="mb-6"></div>
        </div>
      </div>
    </div>
  );
}
