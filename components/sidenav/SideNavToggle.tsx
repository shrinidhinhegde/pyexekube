import {PanelLeftClose, PanelLeftOpen} from "lucide-react";
import {useSidebar} from "@/components/ui/sidebar";
import {Button} from "@/components/ui/button";

export default function SideNavToggle() {
  const {state, toggleSidebar} = useSidebar();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleSidebar}
      aria-label="Toggle Side Nav"
    >
      <PanelLeftOpen
        className={
          "h-[1.2rem] w-[1.2rem] scale-100 transition-all " +
          (state === "collapsed" ? "opacity-100" : "absolute opacity-0")
        }
      />
      <PanelLeftClose
        className={
          "h-[1.2rem] w-[1.2rem] scale-100 transition-all " +
          (state !== "collapsed" ? "opacity-100" : "absolute opacity-0")
        }
      />
      <span className="sr-only">Toggle Side Nav</span>
    </Button>
  );
}