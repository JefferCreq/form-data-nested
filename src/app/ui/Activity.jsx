"use client";

import React, { useState } from "react";

export default function ActivityForm() {
  const [formData, setFormData] = useState({
    type: "",
    item: {
      text: "",
      text_translation: "",
      audio: null, // Se ajusta para manejar archivos
    },
    items: [],
    description: "",
    gives_experience: true,
    challenge: 0,
    phonemes: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name.startsWith("item.") || name.startsWith("items.")) {
      const [key, subkey] = name.split(".");
      // Se maneja si el input es de tipo file
      const updatedValue = files ? files[0] : value;
      const updatedItem = { ...formData[key], [subkey]: updatedValue };
      setFormData({ ...formData, [key]: updatedItem });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/activity-app/activities/`; // Reemplaza con la URL del servidor real
    const data = new FormData();

    // Llenar FormData con el estado actual del formulario
    data.append("type", formData.type);
    data.append("description", formData.description);
    data.append("gives_experience", formData.gives_experience);
    data.append("challenge", formData.challenge);
    data.append("phonemes", formData.phonemes);
    Object.keys(formData.item).forEach((key) => {
      data.append(`item.${key}`, formData.item[key]);
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        body: data, // Se envía como FormData
      });
      const responseData = await response.json();
      console.log(responseData); // Manejar la respuesta del servidor

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to submit activity.");
      }
      setSubmissionResult(responseData);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmissionResult({
        error: "Failed to submit activity. Please try again.",
      });
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="result-container p-10">
        <h3>Submission Result:</h3>
        {submissionResult.error ? (
          <div className="error text-red-500">{submissionResult.error}</div>
        ) : (
          <div className="success text-green-500">
            <p>Activity successfully created!</p>
            <pre>{JSON.stringify(submissionResult, null, 2)}</pre>
          </div>
        )}
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 p-2 bg-blue-500 text-white rounded"
        >
          Submit Another Activity
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-gray-50 p-10 shadow-sm"
    >
      <select
        name="type"
        value={formData.type}
        onChange={handleChange}
        className="flex  shadow-sm bg-white border-gray-300 rounded-lg p-2 w-full"
      >
        <option value="">Select Activity Type</option>
        <option value="PronunciationRecognitionActivity">
          Pronunciation Recognition
        </option>
        <option value="WritingRecognitionActivity">Writing Recognition</option>
        <option value="SentenceMatchingActivity">Sentence Matching</option>
        <option value="ImageMatchingActivity">Image Matching</option>
      </select>
      <input
        type="text"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        className="flex  shadow-sm bg-white border-gray-300 rounded-md p-2 w-full"
      />
      <div className="flex flex-col gap-4 p-8">
        <input
          type="text"
          name="item.text"
          value={formData.item.text}
          onChange={handleChange}
          placeholder="Text"
          className="flex  shadow-sm bg-white border-gray-300 rounded-md p-2 w-full"
        />
        <input
          type="text"
          name="item.text_translation"
          value={formData.item.text_translation}
          onChange={handleChange}
          placeholder="Text Translation"
          className="flex  shadow-sm bg-white border-gray-300 rounded-md p-2 w-full"
        />
        <input
          type="file"
          name="item.audio"
          onChange={handleChange}
          className="flex  shadow-sm bg-white border-gray-300 rounded-md p-2 w-full"
        />
        {formData.type === "WritingRecognitionActivity" && (
          <input
            type="text"
            name="phonemes"
            value={formData.phonemes}
            onChange={handleChange}
            placeholder="Phonemes"
          />
        )}
        {formData.type === "ImageMatchingActivity" && (
          <input
            type="text"
            name="item.image"
            value={formData.item.image}
            onChange={handleChange}
            className="flex  shadow-sm bg-white border-gray-300 rounded-md p-2 w-full"
          />
        )}
      </div>

      <div className="flex flex-row gap-4 w-full">
        Gives Experience
        <input
          type="checkbox"
          name="gives_experience"
          checked={formData.gives_experience}
          onChange={(e) =>
            setFormData({ ...formData, gives_experience: e.target.checked })
          }
        />
      </div>

      <div className="flex flex-row gap-4 w-full items-center">
        <span className="flex whitespace-nowrap">ID Challenge</span>
        <input
          type="number"
          name="challenge"
          value={formData.challenge}
          onChange={handleChange}
          placeholder="Challenge Level"
          className="flex  shadow-sm bg-white border-gray-300 rounded-md p-2 w-full"
        />
      </div>

      <button type="submit">Submit Activity</button>
    </form>
  );
}
