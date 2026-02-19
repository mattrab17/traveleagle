import { supabase } from "@/lib/supabase";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

export const AuthContext = createContext<{
    isLoggedIn: boolean;
    user: any;
    logIn: () => void;
    logOut: () => void;
    isLoading:boolean;
}>({
    isLoggedIn: false,
    isLoading:true,
    user: null,
    logIn: () => {},
    logOut: () => {},
})



export function AuthProvider({ children}: PropsWithChildren ){
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(()=>{
        supabase.auth.getUser().then(({data: {user} }) => {
            setUser(user)
            if(user){
                setIsLoggedIn(true)
            }
            else{
                setIsLoggedIn(false);
            }
        });
        const {data: { subscription }} = supabase.auth.onAuthStateChange(
            (event, session) => {
            if (session && session.user){
                setUser(session.user)
                setIsLoggedIn(true);
            }
            else {
                setUser(null)
                setIsLoggedIn(false);
            }
            setIsLoading(false);
    })
    return () => {
      subscription.unsubscribe()
    } }, [])

    const logIn = () => {
        setIsLoggedIn(true);
    };
    const logOut = async () => {
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        setUser(null);
    };
    
    

    return(
        <AuthContext.Provider value={{isLoggedIn, user, logIn, logOut, isLoading}}>
            {children}
        </AuthContext.Provider>
    )
    
}



export function useAuth(){
        return useContext(AuthContext);
    }