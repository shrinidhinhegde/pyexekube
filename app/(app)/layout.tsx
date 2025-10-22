import {SideNav} from "@/components/sidenav/SideNav";
import {ExecutionProvider} from "@/components/ExecutionProvider";


export default async function AppLayout({children}: { children: React.ReactNode }) {

  return (
    <ExecutionProvider>
      <SideNav/>
      <main className="flex-1 overflow-auto">
        <div className="h-full w-full">
          {children}
        </div>
      </main>
    </ExecutionProvider>
  );
}