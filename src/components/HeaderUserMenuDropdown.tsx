import { useEffect, useRef, useCallback } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import Avatar from "./Avatar";
import { Link } from "react-router-dom";
import shortenMailAddress from "../utils/shortenMailAddres";

// メニューアイテムのプロパティ型定義
interface MenuItemProps {
    to?: string;
    onClick?: () => void;
    icon: React.ReactNode;
    text: string;
    variant?: "default" | "danger";
    className?: string;
}

// 再利用可能なメニューアイテムコンポーネント
function MenuItem({
    to,
    onClick,
    icon,
    text,
    variant = "default",
    className = "",
}: MenuItemProps) {
    const baseClasses =
        "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 cursor-pointer focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset";

    const variantClasses = {
        default: "text-gray-700 focus:ring-blue-500",
        danger: "text-red-600 hover:bg-red-50 focus:bg-red-50 focus:ring-red-500",
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

    const content = (
        <>
            {icon}
            <span>{text}</span>
        </>
    );

    if (to) {
        return (
            <Link
                to={to}
                className={combinedClasses}
                role="menuitem"
                tabIndex={0}
                onClick={onClick}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            className={combinedClasses}
            role="menuitem"
            tabIndex={0}
            onClick={onClick}
        >
            {content}
        </button>
    );
}

// 区切り線コンポーネント
function MenuDivider() {
    return <div className="border-t border-gray-100 my-1"></div>;
}

export default function UserMenuDropdown({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { user, userProfile } = useAuthContext();
    const dropdownRef = useRef<HTMLDivElement>(null);
    console.log(userProfile);

    // ドロップダウン外でのクリックで閉じる
    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        },
        [onClose]
    );

    // ESCキーで閉じる
    const handleEscapeKey = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        },
        [onClose]
    );

    // イベントリスナーの管理
    useEffect(() => {
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside, {
                passive: true,
            });
            document.addEventListener("keydown", handleEscapeKey, {
                passive: true,
            });
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, [isOpen, handleClickOutside, handleEscapeKey]);

    // ログアウト
    const handleSignOut = useCallback(async () => {
        try {
            await signOut(auth);
            onClose();
        } catch (error) {
            console.error("ログアウトエラー:", error);
        }
    }, [onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            ref={dropdownRef}
            className="absolute top-10 right-0 z-[100] bg-white rounded-lg shadow-lg border border-gray-200 min-w-[240px] py-2"
            role="menu"
            aria-label="ユーザーメニュー"
        >
            {/* ユーザー情報セクション */}
            <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <Avatar
                        src={userProfile?.iconUrl || ""}
                        alt="ユーザーアイコン"
                        size={10}
                        rounded={true}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {userProfile?.displayName || "ユーザー"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            @{userProfile?.username || "user"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {shortenMailAddress(user?.email || "")}
                        </p>
                    </div>
                </div>
            </div>

            {/* メニューアイテム */}
            <div className="py-1">
                <MenuItem
                    to={`/@${userProfile?.username}`}
                    onClick={onClose}
                    icon={
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    }
                    text="マイページ"
                />

                <MenuItem
                    to="/add-product"
                    onClick={onClose}
                    icon={
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                    }
                    text="新しく商品を出品する"
                />

                <MenuItem
                    to="/settings"
                    onClick={onClose}
                    icon={
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                    }
                    text="設定"
                />

                <MenuDivider />

                <MenuItem
                    onClick={handleSignOut}
                    variant="danger"
                    icon={
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                    }
                    text="ログアウト"
                />
            </div>
        </div>
    );
}
