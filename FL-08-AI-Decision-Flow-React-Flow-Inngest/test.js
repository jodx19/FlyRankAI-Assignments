const test = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/run-workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nodes: [
          {id:'n1',type:'decision',data:{prompt:'Is it day?'}},
          {id:'n2',type:'decision',data:{prompt:'Yes node'}},
          {id:'n3',type:'decision',data:{prompt:'No node'}}
        ],
        edges: [
          {id:'e1',source:'n1',sourceHandle:'yes',target:'n2'},
          {id:'e2',source:'n1',sourceHandle:'no',target:'n3'}
        ]
      })
    });
    const data = await res.json();
    console.log(data);
  } catch(e) {
    console.error(e);
  }
};
test();
