import type { ReactNode } from "react";
import { createContext, useState, useContext, useEffect } from "react";
import type { User } from "firebase/auth";
import { auth } from "../firebase";
import { getUserProfile } from "../services/userService";
import type { UserProfile } from "../types/user";
import { getUsernameByUid } from "../services/userService";

// 認証コンテキストの型定義 //
interface AuthContextType {
    user: User | null; // Firebaseユーザー情報 //
    userProfile: UserProfile | null; // Firestore上のユーザープロファイル //
    isLoading: boolean; // ローディング状態 //
}

// 認証コンテキストの作成 //
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認証コンテキストのカスタムフック //
export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

// 認証コンポーネント //
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const value: AuthContextType = {
        user,
        userProfile,
        isLoading,
    };

    // Firebaseの認証状態を監視 //
    useEffect(() => {
        const unsubscribed = auth.onAuthStateChanged(async (user) => {
            setUser(user);

            if (user) {
                // ログイン時にユーザープロファイルを取得 //
                console.log("認証ユーザー取得:", user.uid);
                const username = await getUsernameByUid(user.uid);
                console.log("取得したユーザー名:", username);

                if (!username) {
                    console.error(
                        "ユーザー名が取得できませんでした。usernamesコレクションを確認してください。"
                    );
                    setIsLoading(false);
                    return;
                }

                const profile = await getUserProfile(username);
                console.log("取得したプロファイル:", profile);
                setUserProfile(profile);
            } else {
                // ユーザーがログアウトした場合、プロファイルをクリア //
                setUserProfile(null);
            }

            setIsLoading(false); // ローディング終了 //
        });

        return () => {
            unsubscribed();
        };
    }, []);

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
