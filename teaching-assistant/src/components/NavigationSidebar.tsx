"use client";

import { Box, Heading, Text, IconButton } from "@radix-ui/themes";
import {
  ChevronLeft,
  ChevronRight,
  Book,
  Clipboard,
  Pencil,
  BarChart,
  Settings,
  X,
  BrainCircuit,
} from "lucide-react";
import { useViewContext, useAnamContext } from "@/contexts";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import { logger } from "@/utils";

interface MenuItem {
  title: string;
  navigateTo: string;
  Icon: React.ComponentType<any>;
  gap?: boolean;
  clickable: boolean;
}

const Menus: MenuItem[] = [
  { title: "Lessons", navigateTo: "Demo", Icon: Book, clickable: true },
  {
    title: "Vocabulary",
    navigateTo: "Vocabulary",
    Icon: Clipboard,
    clickable: false,
  },
  {
    title: "Practice",
    navigateTo: "Practice",
    Icon: Pencil,
    clickable: false,
    gap: true,
  },
  {
    title: "Progress",
    navigateTo: "Progress",
    Icon: BarChart,
    clickable: false,
  },
  {
    title: "Settings",
    navigateTo: "Settings",
    Icon: Settings,
    clickable: true,
    gap: true,
  },
  {
    title: "Exit",
    navigateTo: "Initial",
    Icon: X,
    clickable: true,
    gap: true,
  },
];

/**
 * SidebarContents component renders the sidebar menu options.
 *
 * @component
 * @param {Object} props - The props for the component.
 * @param {boolean} props.open - Determines if the sidebar is open.
 * @param {string} props.theme - The current theme ("light" or "dark").
 * @param {string} props.currentView - The current selected view.
 * @param {Function} props.handleMenuClick - Function to handle clicks on menu items.
 * @returns {JSX.Element} The sidebar content with menu items.
 */
const SidebarContents = ({
  open,
  theme,
  currentView,
  handleMenuClick,
}: {
  open: boolean;
  theme: string | undefined;
  currentView: string;
  handleMenuClick: (navigateTo: string, clickable: boolean) => void;
}) => {
  return (
    <ul className="pt-6">
      {Menus.map(({ title, navigateTo, Icon, gap, clickable }) => (
        <li
          key={title}
          onClick={() => handleMenuClick(navigateTo, clickable)}
          className={`flex rounded-md p-2 cursor-pointer items-center gap-x-4 text-sm ${
            gap ? "mt-9" : "mt-2"
          } ${
            currentView === navigateTo
              ? "bg-gray-200 dark:bg-gray-700"
              : clickable
                ? "hover:bg-gray-100 dark:hover:bg-gray-800"
                : "opacity-50"
          } ${clickable ? "" : "pointer-events-none"} ${
            open ? "" : "justify-center"
          }`}
        >
          <Icon
            width="20"
            height="20"
            stroke={theme === "dark" ? "white" : "black"}
          />
          {open && (
            <Text
              as="span"
              className="origin-left duration-200 text-gray-900 dark:text-white"
            >
              {title}
            </Text>
          )}
        </li>
      ))}
    </ul>
  );
};

/**
 * NavigationSidebar component renders the navigation sidebar with options like Lessons, Vocabulary, and Practice.
 * It supports toggling between open and collapsed states, and allows the user to navigate to different views.
 *
 * @component
 * @returns {JSX.Element} The navigation sidebar component.
 */
export const NavigationSidebar = () => {
  const [open, setOpen] = useState(false);
  const { currentView, changeView } = useViewContext();
  const { anamClient } = useAnamContext();
  const { theme } = useTheme();
  const router = useRouter();

  /**
   * Handles clicks on menu items. If the item is not clickable, it does nothing.
   * If the "Exit" menu item is clicked, it stops streaming and navigates to the initial page.
   *
   * @async
   * @function
   * @param {string} navigateTo - The view to navigate to.
   * @param {boolean} clickable - Whether the menu item is clickable.
   * @returns {Promise<void>} Resolves when the navigation is complete.
   */
  const handleMenuClick = async (navigateTo: string, clickable: boolean) => {
    if (!clickable) return;

    if (navigateTo === "Initial") {
      await handleExitClick();
    } else {
      if (currentView === "Demo" && navigateTo !== "Demo") {
        if (anamClient) {
          await anamClient.stopStreaming().catch((error) => {
            logger.error("Failed to stop streaming:", error);
          });
        }
      }
      changeView(navigateTo);
      logger.info("stopped streaming");
    }

    setOpen(false);
  };

  /**
   * Handles the exit action by stopping the streaming and navigating to the home page.
   *
   * @async
   * @function
   * @returns {Promise<void>} Resolves when the exit action is complete.
   */
  const handleExitClick = async () => {
    if (anamClient) {
      await anamClient.stopStreaming().catch(console.error);
      logger.info("stopped streaming");
    }
    router.push("/");
    changeView("Demo");
    setOpen(false);
  };

  return (
    <>
      {/* Button to toggle sidebar on smaller screens */}
      {!open && (
        <Box className="lg:hidden fixed top-2 left-2 z-50">
          <IconButton
            size="4"
            onClick={() => setOpen(true)}
            className="p-2 rounded-full bg-black dark:bg-white border border-gray-200 dark:border-gray-700"
          >
            <BrainCircuit stroke={theme === "dark" ? "black" : "white"} />
          </IconButton>
        </Box>
      )}

      <Box
        className={`fixed top-0 left-0 h-screen p-5 pt-8 z-50 bg-white dark:bg-black transition-all duration-300 border-r border-gray-200 dark:border-gray-500 shadow-lg ${
          open
            ? "w-[20vw] min-w-[200px] max-w-[400px]"
            : "w-0 lg:w-[8vw] xl:w-[6vw] 2xl:w-[4vw] min-w-[50px]"
        } ${open ? "block" : "lg:block hidden"}`}
      >
        {/* Toggle Button for large screens */}
        <Box
          className="absolute cursor-pointer -right-4 top-9 w-7 h-7 bg-black dark:bg-white border border-gray-200 dark:border-gray-700 rounded-full"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <ChevronLeft stroke={theme === "dark" ? "black" : "white"} />
          ) : (
            <ChevronRight
              stroke={theme === "dark" ? "black" : "white"}
              className="lg:block hidden"
            />
          )}
        </Box>
        {/* Heading and Icon */}
        <Box className="flex gap-x-4 items-center mb-6">
          <BrainCircuit
            className={`cursor-pointer duration-500 w-10 h-10 ${
              open && "rotate-[360deg]"
            }`}
            stroke={theme === "dark" ? "white" : "black"}
          />

          {open && (
            <Heading className="origin-left font-medium text-xl duration-200 text-gray-900 dark:text-white">
              Teacher
            </Heading>
          )}
        </Box>
        {/* Sidebar Contents */}
        <SidebarContents
          open={open}
          theme={theme}
          currentView={currentView}
          handleMenuClick={handleMenuClick}
        />
      </Box>
    </>
  );
};
