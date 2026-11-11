/* Browser adaptation of library-management-system-project.CPP.
   Uses browser localStorage instead of legacy BOOK.DAT and STUDENT.DAT binary files. */
window.runProject = async function (ui) {
  let books = ui.load('books', []);
  let students = ui.load('students', []);
  const save = () => {ui.save('books',books);ui.save('students',students);};
  const same = (a,b) => String(a).toLowerCase() === String(b).toLowerCase();
  const book = id => books.find(x => same(x.bno,id));
  const student = id => students.find(x => same(x.admno,id));
  const detailsBook = async previous => {
    const bno = previous ? previous.bno : await ui.text('Enter The book no. (max 5 characters):',5);
    const bname = await ui.text(previous?'Modify Book Name:':'Enter The Name of The Book:',49);
    const aname = await ui.text(previous?"Modify Author's Name of Book:":"Enter The Author's Name:",19);
    return {bno,bname,aname};
  };
  const detailsStudent = async previous => {
    const admno = previous ? previous.admno : await ui.text('Enter The admission no. (max 5 characters):',5);
    const name = await ui.text(previous ? 'Modify Student Name:' : 'Enter The Name of The Student:',19);
    return {admno,name,stbno:previous?.stbno||'',token:previous?.token||0};
  };
  function showBook(b) {
    if (!b) {ui.line('Book does not exist');return;}
    ui.line('Book no. : ' + b.bno + '\nBook Name : ' + b.bname + '\nAuthor Name : ' + b.aname);
  }
  function showStudent(s) {
    if (!s) {ui.line('Student does not exist');return;}
    ui.line('Admission no. : ' + s.admno + '\nStudent Name : ' + s.name + '\nNo of Book issued : ' + s.token);
    if (s.token === 1) ui.line('Book No : ' + s.stbno);
  }
  function showBooks() {
    ui.head('BOOK LIST');
    ui.line('BOOK NO.   BOOK NAME                       AUTHOR');ui.rule('=',68);
    books.forEach(b=>ui.line(b.bno.padEnd(11)+b.bname.slice(0,31).padEnd(32)+b.aname));
    if (!books.length) ui.line('No book records created.');
  }
  function showStudents() {
    ui.head('STUDENT LIST');
    ui.line('ADM NO.   NAME                      BOOK ISSUED');ui.rule('=',65);
    students.forEach(s=>ui.line(s.admno.padEnd(10)+s.name.slice(0,25).padEnd(26)+(s.stbno||'—')));
    if (!students.length)ui.line('No student records created.');
  }
  async function issueBook() {
    ui.head('BOOK ISSUE');
    const admission = await ui.text("Enter The student's admission no.:",5);
    const s=student(admission);
    if(!s){ui.line('Student record not exist...');return;}
    if(s.token===1){ui.line('You have not returned the last book.');return;}
    const bookNo=await ui.text('Enter the book no.:',5);
    if(!book(bookNo)){ui.line('Book no does not exist');return;}
    // Original application stores the issue state against the student only.
    s.token=1;s.stbno=bookNo;save();
    ui.line('Book issued successfully');
    ui.line('Please submit within 15 days; fine Rs. 1 per day after 15 days.');
  }
  async function depositBook() {
    ui.head('BOOK DEPOSIT');
    const admission=await ui.text("Enter The student's admission no.:",5);
    const s=student(admission);
    if(!s){ui.line('Student record not exist...');return;}
    if(!s.token){ui.line('No book is issued..please check!!');return;}
    if(!book(s.stbno)){ui.line('Book no does not exist');return;}
    const days=await ui.int('Book deposited in no. of days:',0,36500);
    if(days>15)ui.line('Fine has to deposited Rs. '+(days-15));
    s.token=0;s.stbno='';save();ui.line('Book deposited successfully');
  }
  async function adminMenu() {
    while(true){
      ui.screen('ADMINISTRATOR MENU');
      ui.line('1. CREATE STUDENT RECORD\n2. DISPLAY ALL STUDENTS RECORD');
      ui.line('3. DISPLAY SPECIFIC STUDENT RECORD\n4. MODIFY STUDENT RECORD');
      ui.line('5. DELETE STUDENT RECORD\n6. CREATE BOOK');
      ui.line('7. DISPLAY ALL BOOKS\n8. DISPLAY SPECIFIC BOOK');
      ui.line('9. MODIFY BOOK\n10. DELETE BOOK\n11. BACK TO MAIN MENU');
      const ch=await ui.int('Please Enter Your Choice (1-11):',1,11);
      if(ch===11)return;
      if(ch===1){const s=await detailsStudent();if(student(s.admno))ui.line('Student already exists');else{students.push(s);save();ui.line('Student Record Created..');}}
      else if(ch===2)showStudents();
      else if(ch===3){showStudent(student(await ui.text('Please Enter The Admission No.:',5)));}
      else if(ch===4){const key=await ui.text('Enter The admission no. to modify:',5);const s=student(key);if(!s)ui.line('Record Not Found');else{Object.assign(s,await detailsStudent(s));save();ui.line('Record Updated');}}
      else if(ch===5){const key=await ui.text('Enter The admission no. to delete:',5);if(!student(key))ui.line('Record not found');else{students=students.filter(s=>!same(s.admno,key));save();ui.line('Record Deleted ..');}}
      else if(ch===6){const b=await detailsBook();if(book(b.bno))ui.line('Book already exists');else{books.push(b);save();ui.line('Book Created..');}}
      else if(ch===7)showBooks();
      else if(ch===8)showBook(book(await ui.text('Please Enter The book No.:',5)));
      else if(ch===9){const key=await ui.text('Enter The book no. to modify:',5);const b=book(key);if(!b)ui.line('Record Not Found');else{Object.assign(b,await detailsBook(b));save();ui.line('Record Updated');}}
      else if(ch===10){const key=await ui.text('Enter The Book no. to delete:',5);if(!book(key))ui.line('Record not found');else if(students.some(s=>s.token===1&&same(s.stbno,key))){ui.line('Book currently issued; return it before deleting.');}else{books=books.filter(b=>!same(b.bno,key));save();ui.line('Record Deleted ..');}}
    }
  }
  ui.head('LIBRARY MANAGEMENT SYSTEM');
  while(true){
    ui.screen('MAIN MENU');
    ui.line('01. BOOK ISSUE\n02. BOOK DEPOSIT\n03. ADMINISTRATOR MENU\n04. EXIT');
    const ch=await ui.int('Please Select Your Option (1-4):',1,4);
    if(ch===4){ui.line('Goodbye!');return;}
    if(ch===1)await issueBook();else if(ch===2)await depositBook();else await adminMenu();
  }
};
