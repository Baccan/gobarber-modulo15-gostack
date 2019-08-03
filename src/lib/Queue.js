import Bee from 'bee-queue';
import CancellationMail from '../app/jobs/CancellationMail';
import redisConfig from '../config/redis';

const jobs = [CancellationMail];

class Queue {
  constructor() {
    // pega todos os jobs da aplicação e os armazena
    // recebe a fila (Bee que recebe a conexão com o banco) e o processamento (handle) para executar a tarefa
    // envio de email, ou qualquer tarefa em background
    this.queues = {};

    this.init();
  }

  init() {
    // para cada job, recupera aas propriedades e metodos. no caso, key e handle
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        // bee = fila - recupera e armazena dados do banco
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  // adicionar fila para execução do trabalho
  // queue = fila - como CancelationMail, por exemplo / job = dados do job como 'appointment'
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  // executar processos das queues em tempo real
  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
