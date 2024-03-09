"use client";

import { ChangeEvent, FormEvent, useState } from "react";

const UploadForm = () => {
  const [image, setImage] = useState<string>("");
  const [openAIResponse, setOpenAIResponse] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) {
      window.alert("No file selected. Choose a file");
      return;
    }
    const file = e.target.files[0];

    // convert file to base64 string
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        console.log(reader.result);
        setImage(reader.result);
      }
    };

    reader.onerror = (error) => {
      console.log("error", error);
    };
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (image === "") {
      alert("Upload an image.");
      return;
    }

    await fetch("api/analyzeImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: image,
      }),
    }).then(async (response: any) => {
      // handle streaming text response
      const reader = response.body?.getReader();
      setOpenAIResponse("");

      // reader allow us to read a new piece of info on each "read"
      // "Hello" + "This is" + "Fazley Rabbi" reader.read();
      while (true) {
        const { done, value } = await reader?.read();
        if (done) break;

        // value is uint8array -> a string, decode value,
        // it's going to keep on adding every single chunk response
        const currentChunk = new TextDecoder().decode(value);
        setOpenAIResponse((prev) => prev + currentChunk);
      }
    });
  };

  return (
    <div className="bg-slate-800 w-full max-w-2xl rounded-lg shadow-md p-8">
      <h2 className={"text-xl font-bold mb-4"}>Uploaded Image</h2>
      {image !== "" ? (
        <div className={"mb-4 overflow-hidden"}>
          <img
            src={image}
            className={"w-full object-contain max-h-72"}
            alt="selected-image"
          />
        </div>
      ) : (
        <div className="mb-4 p-8 text-center">
          <p>Once you upload an image, you will see it here.</p>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="flex flex-col mb-6">
          <label className={"mb-2 text-sm font-medium"}>Upload Image</label>
          <input
            className={"text-sm border rounded-lg cursor-pointer"}
            type={"file"}
            onChange={(e) => handleFileChange(e)}
          />
        </div>

        <div className={"flex justify-center"}>
          <button type={"submit"} className={"p-2 bg-sky-600 rounded-md mb-4"}>
            Ask ChatGPT To Analyze Your Image
          </button>
        </div>
      </form>

      {openAIResponse !== "" ? (
        <div className="border-t border-gray-300 pt-4">
          <h2 className="text-xl font-bold mb-2">AI Response</h2>
          <p>{openAIResponse}</p>
        </div>
      ) : null}
    </div>
  );
};

export default UploadForm;
