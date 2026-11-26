/** Daily motivation: one quote per day, cycling through the list by day of year. */
export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: Quote[] = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Không có việc gì khó, chỉ sợ lòng không bền. Đào núi và lấp biển, quyết chí ắt làm nên.", author: "Hồ Chí Minh" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Có công mài sắt, có ngày nên kim.", author: "Tục ngữ Việt Nam" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  { text: "Đi một ngày đàng, học một sàng khôn.", author: "Tục ngữ Việt Nam" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "Kiến tha lâu cũng đầy tổ.", author: "Tục ngữ Việt Nam" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Thất bại là mẹ thành công.", author: "Tục ngữ Việt Nam" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Proverb" },
  { text: "Học, học nữa, học mãi.", author: "V. I. Lenin" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Augusta F. Kantra" },
  { text: "Muốn đi nhanh hãy đi một mình, muốn đi xa hãy đi cùng nhau.", author: "Ngạn ngữ châu Phi" },
  { text: "Small deeds done are better than great deeds planned.", author: "Peter Marshall" },
  { text: "Nước chảy đá mòn.", author: "Tục ngữ Việt Nam" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Hành trình vạn dặm bắt đầu từ một bước chân.", author: "Lão Tử" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Chớ thấy sóng cả mà ngã tay chèo.", author: "Tục ngữ Việt Nam" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Ăn quả nhớ kẻ trồng cây.", author: "Tục ngữ Việt Nam" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "Thua keo này, ta bày keo khác.", author: "Tục ngữ Việt Nam" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao.", author: "Ca dao Việt Nam" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Không thầy đố mày làm nên.", author: "Tục ngữ Việt Nam" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Đường đi khó không khó vì ngăn sông cách núi, mà khó vì lòng người ngại núi e sông.", author: "Nguyễn Bá Học" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Tốt gỗ hơn tốt nước sơn.", author: "Tục ngữ Việt Nam" },
  { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
  { text: "Học thầy không tày học bạn.", author: "Tục ngữ Việt Nam" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Lửa thử vàng, gian nan thử sức.", author: "Tục ngữ Việt Nam" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Ai ơi đã quyết thì hành, đã đan thì lận tròn vành mới thôi.", author: "Ca dao Việt Nam" },
  { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius" },
  { text: "Siêng làm thì có, siêng học thì hay.", author: "Tục ngữ Việt Nam" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Muốn biết phải hỏi, muốn giỏi phải học.", author: "Tục ngữ Việt Nam" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "Có chí thì nên.", author: "Tục ngữ Việt Nam" },
  { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
  { text: "Một nghề cho chín còn hơn chín nghề.", author: "Tục ngữ Việt Nam" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent van Gogh" },
  { text: "Gần mực thì đen, gần đèn thì sáng.", author: "Tục ngữ Việt Nam" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "Trăm hay không bằng tay quen.", author: "Tục ngữ Việt Nam" },
];

export function quoteOfDay(isoDate: string): Quote {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dayOfYear = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000);
  return QUOTES[(dayOfYear + y) % QUOTES.length];
}
