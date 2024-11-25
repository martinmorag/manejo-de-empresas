import Link from "next/link";
import { Metadata } from "next";

export const metadata : Metadata = {
  title: "Crece",
  description: "Bienvenido a Crece, acá va a poder organizar y mantener registros de su negocio actualizado y de manera eficiente.",
};

export default function Home() {

  // const [data, setData] = useState([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const res = await fetch("/api/demo");
  //       if (!res.ok) {
  //           throw new Error('Network response was not ok');
  //       }
  //       const data = await res.json();
  //       console.log('API response:', data);
  //       setData(data);
  //     } catch (error: any) {
  //         console.log(error.message);
  //     }
      
  //   };
  
  //   fetchData();
  // }, []);

  return (
    <main className="flex min-h-screen flex-col items-start justify-end p-2 bg-[url('/HomePage.png')] bg-cover bg-center h-64 w-full4">
      <div className="mb-[10vh] ml-[15vw] w-[20vw] text-center">
        <p className="text-3xl text-main font-bold mb-[3rem]">Inicia sesión para hacer gestión de sus finanzas</p>
        <Link 
        href="/ingreso"
        className="text-2xl px-3 py-2 border-main border-[3px] border-solid rounded-xl hover:bg-main hover:text-white transition-colors duration-300 ease-in-out"
        >Ir al inicio de sesión</Link>
      </div>
      {/* {data.map((item : any) => (
        <div key={item.id}>
          <h2>{item.name}</h2>
          <p>{item.description}</p>
        </div>
      ))} */}
    </main>
  );
}
