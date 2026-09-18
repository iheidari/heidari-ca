import {
  GithubIcon,
  LinkedinIcon,
  MailIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/icons";
import SmartLink from "@/components/SmartLink";
import { site } from "@/content/site";
import styles from "./SocialLinks.module.css";

const links = [
  { label: "GitHub", href: site.socials.github, Icon: GithubIcon },
  { label: "LinkedIn", href: site.socials.linkedin, Icon: LinkedinIcon },
  { label: "X (Twitter)", href: site.socials.twitter, Icon: XIcon },
  { label: "YouTube", href: site.socials.youtube, Icon: YoutubeIcon },
  { label: "Email", href: site.mailto, Icon: MailIcon },
];

export default function SocialLinks({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <ul
      className={size === "sm" ? `${styles.list} ${styles.sm}` : styles.list}
      role="list"
    >
      {links.map(({ label, href, Icon }) => (
        <li key={label}>
          <SmartLink
            className={styles.link}
            href={href}
            aria-label={label}
            title={label}
          >
            <Icon />
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}
