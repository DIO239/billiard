import { IProduct } from "@/types/product";
import { FaShoppingCart } from "react-icons/fa";

export default function BuyButton(props: Pick<IProduct, 'price'>) {
    return(
    <div className='
        cursor-pointer
        relative
        flex 
        items-center 
        w-[150px] 
        h-[45px] 
        rounded-full 
        bg-[#000000] 
        pl-4 
        pt-1 
        pb-1'
    >
        <p className='text-white text-xl font-medium'>{props.price}₽</p>
        <div className='
            absolute 
            right-0 
            flex 
            items-center 
            justify-center 
            bg-white
            rounded-full 
            h-full
            w-[45px]
            shadow-xs
            inset-shadow-black
            shadow-black'
        >
            <FaShoppingCart className='text-black text-xl' />
        </div>
    </div>
    );
}