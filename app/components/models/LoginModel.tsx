'use client';

import { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import useLoginModel from '../hooks/useLoginModel';
import useRegisterModel from '../hooks/useRegisterModel';
import Model from './Model';
import Heading from '../Heading';
import Input from '../inputs/Input';

const LoginModel = () => {
    const loginModel = useLoginModel();
    const registerModel = useRegisterModel();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FieldValues>({
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true);
        // Replace with actual API call later
        console.log("Login submitted:", data);
        
    
        setTimeout(() => {
            toast.success('Logged in successfully!');
            loginModel.onClose();
            setIsLoading(false);
        }, 1000);
    };

    const toggle = () => {
        loginModel.onClose();
        registerModel.onOpen();
    };

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Heading 
                title="Welcome back" 
                subtitle="Login to your account!" 
            />
            <Input
                id="email"
                label="Email"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
            <Input
                id="password"
                type="password"
                label="Password"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
        </div>
    );

    const footerContent = (
        <div className="flex flex-col gap-4 mt-3">
            <hr />
            <div 
                className="
                text-neutral-500 
                text-center 
                mt-4 
                font-light
                "
            >
                <div className="flex flex-row items-center justify-center gap-2">
                    <div>
                        First time using Airbnb?
                    </div>
                    <div 
                        onClick={toggle} 
                        className="
                        text-neutral-800 
                        cursor-pointer 
                        hover:underline
                        "
                    >
                        Create an account
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <Model
            disabled={isLoading}
            isOpen={loginModel.isOpen}
            title="Login"
            actionLabel="Continue"
            onClose={loginModel.onClose}
            onSubmit={handleSubmit(onSubmit)}
            body={bodyContent}
            footer={footerContent}
        />
    );
};

export default LoginModel;