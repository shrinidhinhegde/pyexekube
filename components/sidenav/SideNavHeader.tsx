import SideNavToggle from "@/components/sidenav/SideNavToggle";
import {SidebarHeader, useSidebar} from "@/components/ui/sidebar";
import {useEffect, useState} from "react";
import Image from "next/image";

export default function SideNavHeader() {
  const {state} = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SidebarHeader className="flex items-center gap-2">
      {mounted && (
        state !== "collapsed" ? (
          <>
            <div className="flex flex-row items-stretch justify-between w-full">
              <div className="flex items-center gap-2">
                <Image 
                  src="/pyexekube-logo.svg" 
                  alt="PyExeKube Logo" 
                  width={32} 
                  height={32}
                  className="flex-shrink-0"
                />
                <h1 className="text-xl font-bold">PyExeKube</h1>
              </div>
              <div className="ml-2 flex items-center">
                <SideNavToggle/>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="flex flex-col items-center">
              <Image 
                src="/pyexekube-logo.svg" 
                alt="PyExeKube Logo" 
                width={28} 
                height={28}
                className="mb-2"
              />
              <SideNavToggle/>
            </div>
          </div>
        )
      )}
    </SidebarHeader>
  )
}