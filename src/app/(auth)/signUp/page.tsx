import React from 'react';
import {SignUpFormComponent} from "@/app/(auth)/signUp/components/signupFormComponent";

const SignUp = () => {
    return (
        <div className="flex items-center justify-center w-screen h-screen">
            <SignUpFormComponent/>
        </div>
    );
};

export default SignUp;
