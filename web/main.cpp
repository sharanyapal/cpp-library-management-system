// Browser adapter: compiles the ORIGINAL project to WebAssembly.
// Only historical DOS APIs are translated. Original .cpp is not modified.
#include <iostream>
#include <fstream>
#include <iomanip>
#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <cctype>
#include <ctime>
#include <string>
#include <stdlib.h>
#include <stdio.h>
#include <time.h>
#include <string.h>
#include <streambuf>
using namespace std;
inline void clrscr(){cout<<"\n\n--------------- NEXT SCREEN ---------------\n";}
inline void gotoxy(int,int){cout<<"\n";}
inline int getch(){char c;return (cin>>c)?(unsigned char)c:-1;}
inline int getche(){return getch();}
inline void randomize(){srand((unsigned)time(nullptr));}
inline int random(int n){return n>0?rand()%n:0;}
inline int strcmpi(const char* a,const char* b){
  while(*a&&*b){
    int x=tolower((unsigned char)*a++),y=tolower((unsigned char)*b++);
    if(x!=y)return x-y;
  }
  return (unsigned char)*a-(unsigned char)*b;
}
template<size_t N> char* legacy_gets(char (&b)[N]){
  cin>>ws;
  if(!cin.getline(b,(streamsize)N))return nullptr;
  return b;
}
inline int browser_system(const char* cmd){
  if(cmd&&(!strcmp(cmd,"cls")||!strcmp(cmd,"clear")))clrscr();
  return 0;
}
#define gets legacy_gets
#define system browser_system
#define main project_original_main
#include "source_port.cpp"
#undef main
#undef system
#undef gets

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
EM_JS(int, browser_read_char, (), {
  const c=Module.pollInput();
  if(c>=0)return c;
  return Asyncify.handleSleep(function(wake){Module.waitForInput(wake);});
});
EM_JS(void, browser_write, (const char* s,int n), {
  Module.terminalWrite(UTF8ToString(s,n));
});
#else
inline int browser_read_char(){return getchar();}
inline void browser_write(const char* s,int n){fwrite(s,1,n,stdout);fflush(stdout);}
#endif
class TerminalInput: public streambuf{
  char ch_{};
protected:
  int_type underflow()override{
    int c=browser_read_char();
    if(c<0)return traits_type::eof();
    ch_=(char)c;setg(&ch_,&ch_,&ch_+1);
    return traits_type::to_int_type(ch_);
  }
};
class TerminalOutput: public streambuf{
protected:
  int_type overflow(int_type c)override{
    if(!traits_type::eq_int_type(c,traits_type::eof())){
      char ch=(char)c;browser_write(&ch,1);
    }
    return c;
  }
  streamsize xsputn(const char* s,streamsize n)override{
    browser_write(s,(int)n);return n;
  }
};
int main(){
  static TerminalInput input;
  static TerminalOutput output;
  cin.rdbuf(&input);
  cout.rdbuf(&output);
  cerr.rdbuf(&output);
  cout<<unitbuf;
  project_original_main();
  cout.flush();
  return 0;
}
