"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ClanMember } from "@/lib/prisma/types";

/**
 * MentionInput Component
 *
 * A textarea with @ mention functionality for tagging clan members.
 *
 * Features:
 * - Type @ to trigger member dropdown
 * - Filter members as you type
 * - Navigate with arrow keys (up/down)
 * - Select with Enter or Tab
 * - Escape to close dropdown
 * - Auto-resize textarea
 * - Click outside to close dropdown
 */

interface MentionInputProps {
  /** Current value of the input */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Optional keydown handler for additional functionality */
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum length of input */
  maxLength?: number;
  /** Whether input is disabled */
  disabled?: boolean;
  /** CSS classes for styling */
  className?: string;
  /** Array of clan members available for mentioning */
  members: ClanMember[];
  /** Current user to exclude from mentions */
  currentUser?: { fid: number; username: string };
}

interface MentionDropdownProps {
  members: ClanMember[];
  searchTerm: string;
  selectedIndex: number;
  onSelect: (member: ClanMember) => void;
  position: { top: number; left: number };
  visible: boolean;
}

const MentionDropdown: React.FC<MentionDropdownProps> = ({
  members,
  searchTerm,
  selectedIndex,
  onSelect,
  position,
  visible,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter members based on search term (case-insensitive)
  const filteredMembers = members.filter((member) =>
    member.user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (visible && dropdownRef.current) {
      const selectedItem = dropdownRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, visible]);

  if (!visible || filteredMembers.length === 0) {
    return null;
  }

  // Calculate if there's enough space above for the dropdown
  const dropdownHeight = Math.min(filteredMembers.length * 60, 192); // max-h-48 = 192px
  const spaceAbove = position.top;
  const shouldShowAbove = spaceAbove > dropdownHeight + 20; // 20px buffer

  return (
    <div
      ref={dropdownRef}
      className="absolute z-[9999] bg-[#6D4C2C] border border-[#8B5E3C] rounded-lg shadow-xl max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#5B4120] [&::-webkit-scrollbar-thumb]:bg-yellow-600/60 [&::-webkit-scrollbar-thumb:hover]:bg-yellow-600/80"
      style={{
        ...(shouldShowAbove
          ? { bottom: "calc(100% + 4px)" }
          : { top: "calc(100% + 4px)" }),
        left: 0,
        right: 0,
        minWidth: "200px",
        boxShadow:
          "0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(139, 94, 60, 0.5)",
      }}
    >
      {/* Scroll indicator at top */}
      {filteredMembers.length > 4 && (
        <div className="sticky top-0 h-1 bg-gradient-to-b from-[#8B5E3C] to-transparent pointer-events-none" />
      )}
      {filteredMembers.map((member, index) => (
        <div
          key={member.fid}
          className={`flex items-center gap-2 p-2 cursor-pointer transition-colors duration-150 ${
            index === selectedIndex
              ? "bg-[#A17449] text-white shadow-sm"
              : "hover:bg-[#8B5E3C] text-white/90"
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(member);
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="w-6 h-6 rounded-full bg-[#5A4129] flex items-center justify-center overflow-hidden border border-[#8B5E3C]">
            {member.user.selectedAvatarUrl || member.user.avatarUrl ? (
              <Image
                src={
                  member.user.selectedAvatarUrl || member.user.avatarUrl || ""
                }
                alt={member.user.username}
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-white">
                {member.user.username.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-white/90 text-sm">
              {member.user.username}
            </span>
            {member.role !== "member" && (
              <span
                className={`text-xs ${
                  member.role === "leader" ? "text-[#D4AF37]" : "text-[#B8B8B8]"
                }`}
              >
                {member.role}
              </span>
            )}
          </div>
        </div>
      ))}

      {/* Scroll indicator at bottom */}
      {filteredMembers.length > 4 && (
        <div className="sticky bottom-0 h-1 bg-gradient-to-t from-[#8B5E3C] to-transparent pointer-events-none" />
      )}
    </div>
  );
};

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange: onChangeAction,
  onKeyDown,
  placeholder,
  maxLength,
  disabled,
  className,
  members,
  currentUser,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // State for managing mention dropdown
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [mentionSearchTerm, setMentionSearchTerm] = useState("");
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);

  // Filter out current user from members list
  const availableMembers = currentUser
    ? members.filter((member) => member.user.fid !== currentUser.fid)
    : members;

  // Get cursor position for dropdown placement
  const getCursorPosition = () => {
    if (!textareaRef.current) return { top: 0, left: 0 };

    const textarea = textareaRef.current;
    const rect = textarea.getBoundingClientRect();

    return {
      top: rect.top,
      left: rect.left,
    };
  };

  // Simple positioning - dropdown will be positioned relative to parent

  // Handle input changes and detect mention triggers
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChangeAction(newValue);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    // Check if we should show mention dropdown
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      const hasSpaceAfterAt = textAfterAt.includes(" ");

      // Show dropdown if @ is followed by text without spaces
      if (!hasSpaceAfterAt && availableMembers.length > 0) {
        setMentionStartIndex(lastAtIndex);
        setMentionSearchTerm(textAfterAt);
        setSelectedMentionIndex(0);
        setDropdownPosition(getCursorPosition());
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  };

  // Handle key down events for mention navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showDropdown) {
      const filteredMembers = availableMembers.filter((member) =>
        member.user.username
          .toLowerCase()
          .includes(mentionSearchTerm.toLowerCase()),
      );

      // Navigate dropdown with arrow keys
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev < filteredMembers.length - 1 ? prev + 1 : 0,
        );
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredMembers.length - 1,
        );
        return;
      }

      // Select mention with Enter or Tab
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (filteredMembers[selectedMentionIndex]) {
          handleMentionSelect(filteredMembers[selectedMentionIndex]);
        }
        return;
      }

      // Close dropdown with Escape
      if (e.key === "Escape") {
        e.preventDefault();
        setShowDropdown(false);
        return;
      }
    }

    // Call parent keydown handler if provided
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // Handle mention selection and insertion
  const handleMentionSelect = (member: ClanMember) => {
    if (mentionStartIndex === -1) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    // Replace the @ and search term with the selected mention
    const beforeMention = value.substring(0, mentionStartIndex);
    const afterMention = value.substring(textarea.selectionStart);
    const newValue = `${beforeMention}@${member.user.username} ${afterMention}`;

    onChangeAction(newValue);
    setShowDropdown(false);

    // Position cursor after the mention (async to ensure DOM update)
    setTimeout(() => {
      const newCursorPosition =
        mentionStartIndex + member.user.username.length + 2;
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      textarea.focus();
    }, 0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div
      className="relative w-full"
      style={{ zIndex: showDropdown ? 1000 : "auto" }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={`${className} ${showDropdown ? "ring-2 ring-[#FFB938]/50" : ""}`}
        rows={1}
        style={{
          minHeight: "2.5rem",
          maxHeight: "8rem",
          resize: "none",
          overflow: "hidden",
          transition: "box-shadow 0.2s ease-in-out",
        }}
      />

      <MentionDropdown
        members={availableMembers}
        searchTerm={mentionSearchTerm}
        selectedIndex={selectedMentionIndex}
        onSelect={handleMentionSelect}
        position={dropdownPosition}
        visible={showDropdown}
      />
    </div>
  );
};
