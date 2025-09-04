import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  console.log("A new user was created:", user.uid);

  const project = {
    name: "Mein erstes Projekt",
    owner: user.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const projectRef = await admin.firestore().collection("projects").add(project);

  const tasks = [
    {
      name: "Welcome to your new project!",
      status: "todo",
      projectId: projectRef.id,
      owner: user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      name: "You can add new tasks using the 'New Task' button.",
      status: "todo",
      projectId: projectRef.id,
      owner: user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      name: "You can also use the AI-powered 'Smart Task' feature to automatically generate tasks for you.",
      status: "todo",
      projectId: projectRef.id,
      owner: user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ];

  const batch = admin.firestore().batch();
  tasks.forEach((task) => {
    const taskRef = admin.firestore().collection("tasks").doc();
    batch.set(taskRef, task);
  });

  await batch.commit();
});
