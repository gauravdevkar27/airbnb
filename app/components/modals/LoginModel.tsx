'use client';
import axios from 'axios';
import { AiFillAccountBook, AiFillGitlab } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import { useCallback, useState } from 'react';
import { signIn} from 'next-auth/react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import useLoginModel from '@/app/hooks/useLoginModal';
import Modal from './Modal';
import Heading from '../Heading';
import Input from '../inputs/Input';
import toast from 'react-hot-toast';
import Button from '../Button';
import { useRouter } from 'next/navigation';
import { register } from 'module';


const LoginModel = () => {
    const router = useRouter();
    const LoginModel = useLoginModel();
    const [isLoading, setIsLoading] = useState(false);
    const {
      register,  handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>({
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true);
        signIn('credentials', {
            ...data,
            redirect: false,
        }).then((callback) =>{
            setIsLoading(false);

            if(callback?.ok){
                toast.success('Logged in');
                router.refresh();
                LoginModel.onClose();
            }
            if(callback?.error){
                toast.error(callback.error);
            }
        })
    }

    const bodyContent = (
        <div className='flex flex-col gap-4'>
            <Heading
                title='Welcome back'
                subtitle='Login to your account'
            />
            <Input
                id="email"
                label='Email'
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
           
            <Input
                id="password"
                type='Password'
                label='Password'
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
        </div>
    )

    const footerContent = (
        <div className='flex flex-col gap-4 mt-3'>
            <hr />
            <Button
                outline
                label='Continue with Google'
                icon={FcGoogle}
                onClick={() => { }}
            />
            <Button
                outline
                label='Continue with Github'
                icon={AiFillGitlab}
                onClick={() => { }}
            />
            <div className='
            text-neutral-500
            text-center
            mt-4
            font-light

            '>
                <div className='
                justify-center flex flex-row items-center gap-2
                '>
                    <div>Already have an account?</div>
                    <div
                    onClick={LoginModel.onClose}
                    className='
                text-neutral-800
                cursor-pointer
                hover:underline
                '>
                    Log in
                </div>
                </div>
              

            </div>
        </div>
    )

    return (
        <Modal
            disabled={isLoading}
            isOpen={LoginModel.isOpen}
            title='Login'
            actionLabel='Countinue'
            onClose={LoginModel.onClose}
            onSubmit={handleSubmit(onSubmit)}
            body={bodyContent}
            footer={footerContent}
        />
    )
}

export default LoginModel;