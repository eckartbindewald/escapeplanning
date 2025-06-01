import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js to use WASM
env.useBrowserCache = false;
env.allowLocalModels = false;

async function testLLM() {
  console.log('Testing LLM model Xenova/LaMini-Flan-T5-783M...');
  
  try {
    console.log('Initializing pipeline...');
    const generator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-783M');
    
    console.log('Generating test response...');
    const result = await generator('Tell me a short story about a wise owl', {
      max_new_tokens: 100,
      temperature: 0.7,
      do_sample: true
    });
    
    console.log('\nGenerated Response:');
    console.log(result[0].generated_text);
    console.log('\nModel test completed successfully!');
    
  } catch (error) {
    console.error('Error testing LLM:');
    console.error(error);
  }
}

testLLM();