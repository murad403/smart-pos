import { UserData } from "@/redux/features/auth/auth.type";

const USER_COOKIE_KEY = "user_data";


/**
 * Sets a cookie in the browser
 */
export const setCookie = (name: string, value: string, days?: number) => {
    if (typeof window === "undefined") return;

    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = `; expires=${date.toUTCString()}`;
    }

    // Set cookie with security attributes (SameSite=Lax)
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax; Secure`;
};


/**
 * Gets a cookie by name
 */
export const getCookie = (name: string): string | null => {
    if (typeof window === "undefined") return null;

    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            try {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            } catch (e) {
                return c.substring(nameEQ.length, c.length);
            }
        }
    }
    return null;
};


/**
 * Deletes a cookie by name
 */
export const deleteCookie = (name: string) => {
    if (typeof window === "undefined") return;
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure`;
};


/**
 * Saves user data in localStorage
 */
export const saveUserData = (userData: UserData, rememberMe: boolean = true) => {
    if (typeof window === "undefined") return;
    const value = JSON.stringify(userData);
    localStorage.setItem(USER_COOKIE_KEY, value);
};


/**
 * Retrieves user data from localStorage
 */
export const getUserData = (): UserData | null => {
    if (typeof window === "undefined") return null;
    const value = localStorage.getItem(USER_COOKIE_KEY);
    if (!value) return null;
    try {
        return JSON.parse(value) as UserData;
    } catch (e) {
        console.error("Failed to parse user data from localStorage:", e);
        return null;
    }
};


/**
 * Removes user data from localStorage
 */
export const clearUserData = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(USER_COOKIE_KEY);
    localStorage.removeItem("selectedDevice");
    localStorage.removeItem("table");
    localStorage.removeItem("tableId");
};
