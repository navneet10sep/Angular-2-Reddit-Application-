export interface Newpost {
  title: string;
  postType: {
    type: string; // must be either 'bank' or 'card'
    text: {
      desc: string;  
    },
    link: {
      link: string;
    }
  }
}