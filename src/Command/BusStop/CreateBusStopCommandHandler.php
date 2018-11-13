<?php

namespace App\Command\BusStop;

use App\Command\CommandHandlerInterface;
use App\Entity\BusStop;
use App\Repository\BusStopGroup\GetBusStopGroupById;
use Doctrine\ORM\EntityManagerInterface;

final class CreateBusStopCommandHandler implements CommandHandlerInterface
{
    private $entityManager;
    private $getBusStopGroupById;

    public function __construct(
        EntityManagerInterface $entityManager,
        GetBusStopGroupById $getBusStopGroupById
    )
    {
        $this->entityManager = $entityManager;
        $this->getBusStopGroupById = $getBusStopGroupById;
    }

    public function __invoke(CreateBusStopCommand $command): void
    {
        $group = $command->group() ? $this->getBusStopGroupById->__invoke($command->group()) : null;
        $busStop = new BusStop($command->id(), $command->location(), $group);
        $this->entityManager->persist($busStop);
        $this->entityManager->flush();
    }
}