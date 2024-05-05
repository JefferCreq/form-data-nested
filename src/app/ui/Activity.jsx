"use client";
import { useState } from "react";

export default function ActivityForm() {
  const [accessToken, setAccessToken] = useState("");
  const [formData, setFormData] = useState({
    type: "PronunciationRecognitionActivity",
    items: [
      {
        text: "",
        text_translation: "",
        audio: null,
        image: null,
      },
    ],
    description: "Description example",
    gives_experience: true,
    challenge: 1,
    phonemes: "",
  });

  const oneItem = [
    "PronunciationRecognitionActivity",
    "WritingRecognitionActivity",
  ];
  const manyItems = ["SentenceMatchingActivity", "ImageMatchingActivity"];

  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const handleChange = (e, index) => {
    const { name, value, files } = e.target;
    const updatedItems = [...formData.items];
    const updatedValue = files ? files[0] : value;

    if (name.startsWith("items.")) {
      const subkey = name.split(".")[1];
      updatedItems[index][subkey] = updatedValue;
      setFormData({ ...formData, items: updatedItems });
      return;
    }

    if (name === "type" && oneItem.includes(value)) {
      setFormData({
        ...formData,
        [name]: value,
        items: [
          {
            text: "",
            text_translation: "",
            audio: null,
            image: null,
          },
        ],
      });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleAddItem = () => {
    const newItem = {
      text: "",
      text_translation: "",
      audio: null,
      image: null,
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData({ ...formData, items: updatedItems });
  };

  const postItem = async (item) => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/activity-app/items/`;
    const data = new FormData();
    Object.keys(item).forEach((key) => {
      const value = item[key];
      if (value) {
        data.append(key, value);
      }
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: data,
    });

    const responseData = await response.json();
    return responseData; // Asumiendo que la respuesta incluye un 'id'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const activityUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/activity-app/activities/`;

      const activityData = {
        type: formData.type,
        description: formData.description,
        gives_experience: formData.gives_experience,
        challenge: formData.challenge,
        phonemes: formData.phonemes,
      };

      const activityResponse = await fetch(activityUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(activityData),
      });

      if (!activityResponse.ok) {
        throw new Error("Failed to submit activity.");
      }
      const activityResponseData = await activityResponse.json();

      const items = await Promise.all(
        formData.items.map((item) =>
          postItem({ ...item, activity: activityResponseData.id })
        )
      );

      setSubmissionResult({ ...activityResponseData, items });
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
            <pre className="whitespace-break-spaces text-sm">
              {JSON.stringify(submissionResult, null, 2)}
            </pre>
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
      className="flex flex-col gap-4 bg-white p-14 shadow-sm text-sm"
    >
      <input
        type="text"
        name="access_token"
        value={accessToken}
        onChange={(e) => setAccessToken(e.target.value)}
        placeholder="Access Token"
        className="flex border border-gray-300 rounded p-2"
      />
      <select
        name="type"
        value={formData.type}
        onChange={handleChange}
        className="flex border bg-white border-gray-300 rounded p-2 w-full"
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
        className="flex border border-gray-300 rounded p-2"
      />
      <div className="flex flex-row gap-4 w-full items-center">
        <span className="flex whitespace-nowrap px-4">ID Challenge</span>
        <input
          type="number"
          name="challenge"
          value={formData.challenge}
          onChange={handleChange}
          placeholder="Challenge Level"
          className="flex border border-gray-300 rounded p-2 w-full"
        />
      </div>
      {formData.type === "WritingRecognitionActivity" && (
        <input
          type="text"
          name="phonemes"
          value={formData.phonemes}
          onChange={handleChange}
          placeholder="Phonemes"
          className="flex border border-gray-300 rounded p-2"
        />
      )}
      <div className="flex flex-col gap-6 w-full items-center p-4">
        {formData.items.map((item, index) => (
          <div key={index} className="item-entry flex flex-col gap-2 p-2">
            <input
              type="text"
              name="items.text"
              value={item.text}
              onChange={(e) => handleChange(e, index)}
              placeholder="Text"
              className="flex border border-gray-300 rounded p-2 w-full"
            />
            <input
              type="text"
              name="items.text_translation"
              value={item.text_translation}
              onChange={(e) => handleChange(e, index)}
              placeholder="Text Translation"
              className="flex border border-gray-300 rounded p-2 w-full"
            />
            <input
              type="file"
              name="items.audio"
              onChange={(e) => handleChange(e, index)}
              placeholder="Auidio"
              className="flex border border-gray-300 rounded p-2 w-full"
            />
            {formData.type === "ImageMatchingActivity" && (
              <input
                type="file"
                name="items.image"
                onChange={(e) => handleChange(e, index)}
                placeholder="Image"
                className="flex border border-gray-300 rounded p-2 w-full"
              />
            )}
            {manyItems.includes(formData.type) ? (
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="remove-item-btn border border-red-600 text-red-600 p-2 rounded"
              >
                Remove Item
              </button>
            ) : null}
          </div>
        ))}
      </div>
      {manyItems.includes(formData.type) ? (
        <button
          type="button"
          onClick={handleAddItem}
          className="border border-blue-600 text-blue-600 p-2 rounded"
        >
          Add New Item
        </button>
      ) : null}

      <button
        type="submit"
        className="bg-neutral-800 hover:bg-neutral-700 text-white p-2 rounded
        border border-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={
          !formData.type || !formData.description || !formData.challenge || !accessToken
        }
      >
        Submit Activity
      </button>
    </form>
  );
}
