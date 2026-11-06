/**
 * showcaseData.js
 * Pre-populated realistic NCERT curriculum chats, sample learner assessment profile,
 * and client-side conversational fallbacks for showcase, demo, and static preview deployments.
 */

export const DEMO_USER = {
  id: 'demo-student',
  displayName: 'Vicky',
  email: 'vickydsilva2@gmail.com',
  classStandard: 2
};

export const DEMO_ASSESSMENT = {
  profile: {
    overall: { correct: 18, total: 25 },
    dimensions: {
      pattern_alternation: { correct: 5, total: 6 },
      spatial_transformation: { correct: 4, total: 6 },
      analogical_mapping: { correct: 5, total: 6 },
      multi_rule_integration: { correct: 4, total: 7 }
    }
  },
  completedAt: Date.now() - 3600000
};

export const SHOWCASE_CHATS = [
  {
    id: 'demo-chat-english',
    persistedId: 'demo-chat-english',
    title: 'English Ch 2: Seeing without Seeing',
    updatedAt: Date.now() - 60000,
    messages: [
      {
        role: 'user',
        content: 'i want u to go to my english text book and fetch whatever is going on in chapter 2'
      },
      {
        role: 'assistant',
        content: `I have the official NCERT Class 2 English textbook *Mridang* loaded! 📚✨

In *Mridang*, **Chapter 2** is in **Unit 2: It is Fun** and is titled **"Seeing without Seeing"** [1].

**The Story:**
* **Little Onshangla** comes home from school and is very quiet [1].
* Her mother, **Ava**, notices she is quiet and asks if something happened at school [1].
* Onshangla tells her that a **new boy** joined who wears dark glasses and **cannot see** [1].
* Onshangla asks, *"How will he do things?"*
* Ava gives her biscuits and milk, then plays a **new game**: she ties a soft scarf over Onshangla’s eyes and asks her to guess what she is holding [1].
* Ava holds a **rose**, and Onshangla touches its soft petals to identify it [1]!

**What this chapter teaches:**
Even if we cannot see, our other senses (touch, sound, smell) help us explore the world. It teaches us empathy, kindness, and understanding! 🌹👀

Would you like to try a guessing game like Onshangla and Ava did? Or do you have any questions about the story? 😊`,
        citations: [{ title: 'Class_02 | English | Mridang | pages 40,41,42' }]
      }
    ]
  },
  {
    id: 'demo-chat-maths',
    persistedId: 'demo-chat-maths',
    title: 'Maths Ch 6: Decoration for Festival',
    updatedAt: Date.now() - 120000,
    messages: [
      {
        role: 'user',
        content: 'teach me chapter 6 in my maths'
      },
      {
        role: 'assistant',
        content: `Hello! 🌟 I am so happy to help you with **Chapter 6: Decoration for Festival** from your *Joyful Mathematics* book! 🏮🌸

This chapter is all about adding numbers using **Tens** and **Ones** by counting flower garlands for a festival [1]:

### 1. The Story: Friends Decorating 🌼
Friends bring flowers to make garlands:
* **Rohan** brings **12** flowers ($1$ Ten, $2$ Ones) [1].
* **Suwali** brings **53** flowers ($5$ Tens, $3$ Ones) [1].
* **Zoha** brings **20** flowers ($2$ Tens, $0$ Ones).
* **Javed** brings **43** flowers ($4$ Tens, $3$ Ones).

### 2. Adding with Tens & Ones
* **Add the Tens:** $1 + 5 = 6$ Tens ($60$).
* **Add the Ones:** $2 + 3 = 5$ Ones ($5$).
* **Total:** $60 + 5 =$ **65 flowers**! 🎉

---

**🌟 Quick Question for You:**
If **Simran** has **30** flowers and **Akash** has **8** flowers, how many flowers do they have together? 🧠✨`,
        citations: [{ title: 'Class_02 | Mathematics | Joyful-Mathematics | pages 64,65,66' }]
      }
    ]
  }
];

export function generateShowcaseTutorReply(query, standard = 2) {
  const lower = query.toLowerCase();

  if (lower.includes('english') || lower.includes('chapter 2') || lower.includes('seeing') || lower.includes('ava') || lower.includes('onshangla')) {
    return {
      text: `I would love to help you with Chapter 2 of your English textbook, *Mridang*! 📚✨\n\nThe chapter is called **"Seeing without Seeing"** [1]. It is a heartwarming story about **Little Onshangla** and her mother, **Ava**.\n\n1. **The New Classmate:** Onshangla comes home quiet because a new boy joined who wears dark glasses and cannot see.\n2. **The Senses Game:** Ava ties a scarf around Onshangla's eyes and asks her to identify a flower using only touch and smell.\n3. **The Lesson:** Onshangla realizes that touch, sound, and empathy help us understand the world even when we cannot see!\n\nWould you like to try a guessing game like Ava and Onshangla? 😊`,
      citations: [{ title: 'Class_02 | English | Mridang | pages 40,41,42' }]
    };
  }

  if (lower.includes('math') || lower.includes('chapter 6') || lower.includes('festival') || lower.includes('tens') || lower.includes('ones') || lower.includes('diyas') || lower.includes('flowers')) {
    return {
      text: `Hello! 🌟 Let's learn from **Chapter 6: Decoration for Festival** from your *Joyful Mathematics* book! 🎉🌸\n\nThis chapter teaches how to add numbers by breaking them into **Tens** and **Ones** [1]:\n\n* **Rohan** brought 12 flowers ($1$ Ten and $2$ Ones).\n* **Suwali** brought 53 flowers ($5$ Tens and $3$ Ones).\n* Adding Tens: $1 + 5 = 6$ Tens ($60$).\n* Adding Ones: $2 + 3 = 5$ Ones ($5$).\n* Total: **65 flowers**! 🏮\n\n**Quick Check-in:** If Simran has 20 flowers and Akash has 7 flowers, how many do they have in total? 🧠✨`,
      citations: [{ title: 'Class_02 | Mathematics | Joyful-Mathematics | pages 64,65,66' }]
    };
  }

  if (lower.includes('quiz') || lower.includes('test') || lower.includes('question')) {
    return {
      text: `Here are two practice questions from your Standard ${standard} NCERT curriculum! 🌟\n\n**Question 1 (English - Mridang):**\nIn *"Seeing without Seeing"*, what object did Ava give Onshangla to identify with her eyes closed? [1]\n* A) An apple\n* B) A red rose\n* C) A storybook\n\n**Question 2 (Maths - Joyful Mathematics):**\nIn *"Decoration for Festival"*, how many tens and ones are there in the number **47**? [2]\n* Hint: $40 + 7$\n\nTake your time! What do you think the answers are? 🧠✨`,
      citations: [
        { title: `Class_0${standard} | English | Mridang | pages 40,41` },
        { title: `Class_0${standard} | Mathematics | Joyful-Mathematics | pages 64,65` }
      ]
    };
  }

  return {
    text: `Hello there! 🌟 I'm your NCERT AI Study Buddy for Standard ${standard}! 🎒✨\n\nI have your official curriculum textbooks loaded (*Mridang* and *Joyful Mathematics*) [1].\n\nYou asked: *"${query}"*\n\nHere are some fun topics we can explore together:\n1. 📖 **English (Mridang):** Chapter 2 *"Seeing without Seeing"* or Chapter 1 *"My Bicycle"*.\n2. 🔢 **Mathematics (Joyful Mathematics):** Chapter 6 *"Decoration for Festival"* (Tens and Ones) or Chapter 2 *"Shapes Around Us"*.\n\nWhich chapter or story would you like to explore? 🎈`,
    citations: [{ title: `Class_0${standard} | NCERT Official Curriculum` }]
  };
}
