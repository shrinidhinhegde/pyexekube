import {useEffect, useState} from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useSession} from "next-auth/react";
import {fetcher} from "@/lib/utils";

type UIAvatarProps = {
  src?: string | null;
  fallback?: string;
  className?: string;
};

function isValidUrl(str?: string | null) {
  if (!str) return false;
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export default function UIAvatar({src, fallback, className}: UIAvatarProps) {
  const {data: session} = useSession();
  const [img, setImg] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function resolveImage() {
      const get_signed_url = async (path: string) => {
        return await fetcher(`/api/cloudfront-signed-url`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            path: path,
            seconds: 600
          }),
        })
      }

      if (src) {
        if (isValidUrl(src)) {
          setImg(src);
        } else {
          const res = await get_signed_url(src);
          if (!cancelled && res?.url) setImg(res.url);
        }
        return;
      }
      const image = session?.user?.image;
      if (!image) return;
      const res = await get_signed_url(image);
      if (!cancelled && res?.url) setImg(res.url);
    }

    resolveImage();
    return () => {
      cancelled = true;
    };
  }, [src, session?.user?.image]);

  return (
    <Avatar className={className}>
      {img && <AvatarImage src={img}/>}
      <AvatarFallback>
        {fallback
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase() || "U"}
      </AvatarFallback>
    </Avatar>
  );
}