import React, { useState, useRef, useEffect, useMemo } from "react";
import type {
  IEmojiCategoryData,
  IEmojiResponseDto,
} from "../../../types/emoji";
import { DEFAULT_CATEGORY_TABS } from "../../../types/emoji";
import { searchEmoji, debounce } from "../utils/utils";

interface EmojiPickerProps {
  emojisData: IEmojiCategoryData[];
  recent?: IEmojiResponseDto[];
  onSelect: (codepoint: string) => void;
  onClose: () => void;
}

/**
 * Discord-style emoji picker with categories and search
 */
export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  emojisData,
  recent = [],
  onSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Memoize search results
  const searchResults = useMemo(() => {
    return searchQuery ? searchEmoji(emojisData, searchQuery) : [];
  }, [searchQuery, emojisData]);

  const isSearching = searchQuery.trim().length > 0;

  // Available categories (filter out empty ones)
  const categories = useMemo(() => {
    const cats: string[] = [];
    if (recent.length > 0) cats.push("Recent");

    // Duyệt các tab Unicode
    DEFAULT_CATEGORY_TABS.forEach((tab) => {
      const categoryItem = emojisData.find(
        (d) => typeof d.category === "string" && d.category === tab.key
      );
      if (categoryItem && categoryItem.emojis.length > 0) {
        cats.push(tab.key);
      }
    });

    // Duyệt các custom/community categories
    emojisData.forEach((d) => {
      const name =
        typeof d.category === "string" ? d.category : d.category.name;
      if (!cats.includes(name)) cats.push(name);
    });

    return cats;
  }, [emojisData, recent]);

  // Scroll to category when tab clicked
  const scrollToCategory = (category: string) => {
    const element = categoryRefs.current.get(category);
    if (element && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const offsetTop = element.offsetTop - container.offsetTop - 50;
      container.scrollTo({ top: offsetTop, behavior: "smooth" });
    }
  };

  // Handle scroll to update active category
  useEffect(() => {
    if (isSearching) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = debounce(() => {
      const scrollTop = container.scrollTop;
      let currentCategory = categories[0];

      categories.forEach((cat) => {
        const element = categoryRefs.current.get(cat);
        if (element) {
          const offsetTop = element.offsetTop - container.offsetTop - 100;
          if (scrollTop >= offsetTop) {
            currentCategory = cat;
          }
        }
      });

      setActiveCategory(currentCategory);
    }, 50);

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [categories, isSearching]);

  const handleEmojiClick = (codepoint: string) => {
    onSelect(codepoint);
    onClose(); // Close picker immediately after selection
  };

  const renderEmojiGrid = (emojis: IEmojiResponseDto[]) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(9, 38px)",
        gap: "2px",
        padding: "8px 12px",
        justifyContent: "start",
      }}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji.codepoint}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleEmojiClick(emoji.codepoint || "");
          }}
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent focus/active state
          }}
          style={{
            width: "38px",
            height: "36px",
            padding: "0",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            transition: "background-color 0.1s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#FFE7F0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <img
            src={emoji.twemoji_url}
            alt={emoji.emoji}
            style={{
              width: "30px",
              height: "30px",
              pointerEvents: "none",
            }}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div
      style={{
        width: "428px",
        height: "444px",
        maxHeight: "calc(100vh - 64px)",
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        boxShadow:
          "0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(242, 149, 182, 0.2)",
        border: "1.5px solid #FFE7F0",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily:
          "'Quicksand', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Search Input */}
      <div
        style={{ padding: "12px 12px 8px 12px", backgroundColor: "#FFF8FA" }}
      >
        <input
          type="text"
          placeholder="Tìm emoji hoàn hảo... 💕"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #FFE7F0",
            borderRadius: "6px",
            color: "#4A3C42",
            fontSize: "14px",
            outline: "none",
            fontWeight: 500,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#F295B6";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#FFE7F0";
          }}
          autoFocus
        />
      </div>

      {/* Divider */}
      <div
        style={{
          height: "1px",
          backgroundColor: "#FFE7F0",
          margin: "8px 0 0 0",
        }}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Category Tabs (Left Sidebar) */}
        {!isSearching && (
          <div
            style={{
              width: "48px",
              backgroundColor: "#FFF8FA",
              overflowY: "auto",
              scrollbarWidth: "none",
              padding: "8px 0",
              borderRight: "1.5px solid #FFE7F0",
            }}
          >
            {categories.map((category) => {
              const tab = DEFAULT_CATEGORY_TABS.find((t) => t.key === category);

              // For custom community categories, use community avatar
              let icon = category === "Recent" ? "🕒" : tab?.icon || "😀";
              let communityAvatar: string | undefined;

              // Check if this is a custom category (not in DEFAULT_CATEGORY_TABS)
              if (!tab && category !== "Recent") {
                const categoryEmojis = data[category];
                if (categoryEmojis && categoryEmojis.length > 0) {
                  communityAvatar = categoryEmojis[0]?.community?.avatarUrl;
                }
              }

              return (
                <button
                  key={category}
                  onClick={() => scrollToCategory(category)}
                  style={{
                    width: "100%",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      activeCategory === category ? "#FFE7F0" : "transparent",
                    border: "none",
                    borderLeft:
                      activeCategory === category
                        ? "3px solid #F295B6"
                        : "3px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.1s ease",
                    fontSize: "20px",
                    filter:
                      activeCategory === category
                        ? "grayscale(0%)"
                        : "grayscale(100%)",
                    opacity: activeCategory === category ? 1 : 0.6,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = "grayscale(0%)";
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.backgroundColor = "#FFE7F0";
                  }}
                  onMouseLeave={(e) => {
                    if (activeCategory !== category) {
                      e.currentTarget.style.filter = "grayscale(100%)";
                      e.currentTarget.style.opacity = "0.5";
                    }
                    e.currentTarget.style.backgroundColor =
                      activeCategory === category ? "#FFE7F0" : "transparent";
                  }}
                  title={category}
                >
                  {communityAvatar ? (
                    <img
                      src={communityAvatar}
                      alt={category}
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    icon
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Emoji Grid */}
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "#FFB8D1 #FFF8FA",
            backgroundColor: "#FFFFFF",
          }}
          css={`
            &::-webkit-scrollbar {
              width: 8px;
            }
            &::-webkit-scrollbar-track {
              background: #fff8fa;
            }
            &::-webkit-scrollbar-thumb {
              background-color: #ffb8d1;
              border-radius: 8px;
            }
            &::-webkit-scrollbar-thumb:hover {
              background-color: #f295b6;
            }
          `}
        >
          {isSearching ? (
            // Search Results
            <div>
              {searchResults.length > 0 ? (
                <>
                  <div
                    style={{
                      padding: "16px 16px 8px 16px",
                      color: "#8B7B82",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#FFFFFF",
                      zIndex: 1,
                    }}
                  >
                    Kết quả tìm kiếm
                  </div>
                  {renderEmojiGrid(searchResults)}
                </>
              ) : (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: "#72767d",
                    fontSize: "14px",
                  }}
                >
                  No emojis found
                </div>
              )}
            </div>
          ) : (
            // Categories
            <>
              {recent.length > 0 && (
                <div
                  ref={(el) => {
                    if (el) categoryRefs.current.set("Recent", el);
                  }}
                >
                  <div
                    style={{
                      padding: "16px 16px 8px 16px",
                      color: "#8B7B82",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#FFFFFF",
                      zIndex: 1,
                    }}
                  >
                    🕒 Gần đây
                  </div>
                  {renderEmojiGrid(recent)}
                </div>
              )}

              {DEFAULT_CATEGORY_TABS.map((tab) => {
                const emojis = data[tab.key];
                if (!emojis || emojis.length === 0) return null;

                return (
                  <div
                    key={tab.key}
                    ref={(el) => {
                      if (el) categoryRefs.current.set(tab.key, el);
                    }}
                  >
                    <div
                      style={{
                        padding: "16px 16px 8px 16px",
                        color: "#8B7B82",
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#FFFFFF",
                        zIndex: 1,
                      }}
                    >
                      {tab.label}
                    </div>
                    {renderEmojiGrid(emojis)}
                  </div>
                );
              })}

              {/* RENDER CUSTOM COMMUNITY CATEGORIES */}
              {Object.keys(emojisData).map((categoryKey) => {
                // Skip unicode categories (already rendered above)
                const isUnicodeCategory = DEFAULT_CATEGORY_TABS.some(
                  (tab) => tab.key === categoryKey
                );
                if (isUnicodeCategory) return null;

                const emojis = emojisData[categoryKey];
                if (!emojis || emojis.length === 0) return null;

                // Get community avatar from first emoji
                const firstEmoji = emojis[0];
                const communityAvatar = firstEmoji?.community?.avatarUrl;

                return (
                  <div
                    key={categoryKey}
                    ref={(el) => {
                      if (el) categoryRefs.current.set(categoryKey, el);
                    }}
                  >
                    <div
                      style={{
                        padding: "16px 16px 8px 16px",
                        color: "#F295B6",
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#FFFFFF",
                        zIndex: 1,
                        borderTop: "2px solid #FFE7F0",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {communityAvatar && (
                        <img
                          src={communityAvatar}
                          alt={categoryKey}
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      {categoryKey}
                    </div>
                    {renderEmojiGrid(emojis)}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
